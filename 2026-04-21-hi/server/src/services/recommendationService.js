import Content from '../models/Content.js';
import Interaction from '../models/Interaction.js';
import Watchlist from '../models/Watchlist.js';
import User from '../models/User.js';
import { buildContentVector, buildPreferenceVector, cosineSimilarity } from '../utils/vector.js';
import { moodBoost } from './moodService.js';
import { explainRecommendation } from './llmService.js';

const actionWeights = {
  view: 0.04,
  click: 0.08,
  save: 0.22,
  favorite: 0.34,
  complete: 0.28,
  time_spent: 0.01,
  dismiss: -0.28
};

function mapToObject(value) {
  if (!value) return {};
  return value instanceof Map ? Object.fromEntries(value) : value;
}

export async function refreshUserPreferenceVector(user) {
  const base = buildPreferenceVector(user.preferences || {});
  const positive = await Interaction.find({
    user: user._id,
    action: { $in: ['save', 'favorite', 'complete', 'time_spent'] }
  }).populate('content');

  positive.forEach((signal) => {
    if (!signal.content) return;
    const vector = mapToObject(signal.content.vector);
    const weight = actionWeights[signal.action] * Math.max(signal.value || 1, 1);
    Object.entries(vector).forEach(([key, value]) => {
      base[key] = (base[key] || 0) + value * weight;
    });
  });

  user.preferences.vector = base;
  await user.save();
  return base;
}

export async function ensureContentVectors() {
  const contents = await Content.find();
  await Promise.all(
    contents.map((content) => {
      content.vector = buildContentVector(content);
      return content.save();
    })
  );
}

async function behaviorScores(userId) {
  const interactions = await Interaction.find({ user: userId });
  return interactions.reduce((scores, item) => {
    const id = String(item.content);
    scores[id] = (scores[id] || 0) + (actionWeights[item.action] || 0) * Math.max(item.value || 1, 1);
    return scores;
  }, {});
}

async function collaborativeScores(userId) {
  const myPositive = await Interaction.find({
    user: userId,
    action: { $in: ['save', 'favorite', 'complete'] }
  });
  const mySet = new Set(myPositive.map((i) => String(i.content)));
  if (!mySet.size) return {};

  const others = await Interaction.find({
    user: { $ne: userId },
    action: { $in: ['save', 'favorite', 'complete'] }
  });
  const byUser = new Map();
  others.forEach((i) => {
    const key = String(i.user);
    if (!byUser.has(key)) byUser.set(key, new Set());
    byUser.get(key).add(String(i.content));
  });

  const scores = {};
  byUser.forEach((set) => {
    const overlap = [...set].filter((id) => mySet.has(id)).length;
    const union = new Set([...set, ...mySet]).size;
    const similarity = union ? overlap / union : 0;
    if (similarity > 0) {
      set.forEach((id) => {
        if (!mySet.has(id)) scores[id] = (scores[id] || 0) + similarity * 0.24;
      });
    }
  });
  return scores;
}

export async function getRecommendations(user, { mood, type, limit = 24, query } = {}) {
  const preferenceVector = mapToObject(user.preferences?.vector);
  const activeVector = Object.keys(preferenceVector).length ? preferenceVector : await refreshUserPreferenceVector(user);
  const filter = {};
  if (type && type !== 'all') filter.type = type;
  if (query) filter.$text = { $search: query };

  const [contents, saved, behavior, collaborative] = await Promise.all([
    Content.find(filter).limit(200),
    Watchlist.find({ user: user._id }),
    behaviorScores(user._id),
    collaborativeScores(user._id)
  ]);
  const dismissed = new Set(saved.filter((w) => w.status === 'dismissed').map((w) => String(w.content)));

  const scored = contents
    .filter((content) => !dismissed.has(String(content._id)))
    .map((content) => {
      const vector = mapToObject(content.vector);
      const contentScore = cosineSimilarity(activeVector, vector);
      const quality = Math.min((content.rating || 0) / 10, 1) * 0.1;
      const trend = Math.min((content.popularity || 0) / 100, 1) * 0.08;
      const behaviorScore = behavior[String(content._id)] || 0;
      const collaborativeScore = collaborative[String(content._id)] || 0;
      const moodScore = mood ? moodBoost(content, mood) : 0;
      const score = contentScore * 0.52 + quality + trend + behaviorScore + collaborativeScore + moodScore;
      return {
        ...content.toObject(),
        score: Number(score.toFixed(4)),
        scoreBreakdown: {
          preference: Number(contentScore.toFixed(3)),
          quality: Number(quality.toFixed(3)),
          trending: Number(trend.toFixed(3)),
          behavior: Number(behaviorScore.toFixed(3)),
          collaborative: Number(collaborativeScore.toFixed(3)),
          mood: Number(moodScore.toFixed(3))
        }
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, Number(limit));

  return Promise.all(
    scored.map(async (item) => ({
      ...item,
      reason: await explainRecommendation({ user, content: item, signals: item.scoreBreakdown })
    }))
  );
}

export async function getSimilarContent(contentId, limit = 8) {
  const target = await Content.findById(contentId);
  if (!target) return [];
  const targetVector = mapToObject(target.vector);
  const candidates = await Content.find({ _id: { $ne: target._id }, type: target.type }).limit(120);
  return candidates
    .map((content) => ({
      ...content.toObject(),
      score: cosineSimilarity(targetVector, mapToObject(content.vector))
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export async function updateUserFromInteraction(userId, contentId, action, value = 1, metadata = {}) {
  await Interaction.create({ user: userId, content: contentId, action, value, metadata });
  const user = await User.findById(userId);
  if (['save', 'favorite', 'complete', 'dismiss', 'time_spent'].includes(action)) {
    await refreshUserPreferenceVector(user);
  }
}
