import { askRecommendationAssistant } from '../services/llmService.js';
import { getRecommendations, updateUserFromInteraction } from '../services/recommendationService.js';
import { extractIntent } from '../services/queryIntentService.js';
import { searchUnifiedCatalog } from '../services/catalogService.js';
import { fetchRandomTmdb, tmdbAvailable } from '../services/tmdbService.js';

function scoreCandidate(item, intent, query) {
  let score = 0;
  const genres = new Set((item.genres || []).map((genre) => genre.toLowerCase()));
  const tags = new Set((item.tags || []).map((tag) => tag.toLowerCase()));
  const title = String(item.title || '').toLowerCase();
  const q = String(query || '').toLowerCase();

  if (q && title === q) score += 100;
  else if (q && title.includes(q)) score += 50;

  (intent.genres || []).forEach((genre) => {
    if (genres.has(String(genre).toLowerCase())) score += 3;
  });
  (intent.moods || []).forEach((mood) => {
    if (tags.has(String(mood).toLowerCase()) || String(item.overview || '').toLowerCase().includes(String(mood).toLowerCase())) score += 2;
  });
  (intent.similarTo || []).forEach((reference) => {
    if (title.includes(String(reference).toLowerCase())) score += 4;
  });
  if (intent.maxDurationMinutes && item.durationMinutes && item.durationMinutes <= intent.maxDurationMinutes) score += 2;
  if (intent.minDurationMinutes && item.durationMinutes && item.durationMinutes >= intent.minDurationMinutes) score += 2;
  score += Math.min((item.rating || 0) / 2, 5);
  score += Math.min((item.popularity || 0) / 25, 4);
  return score;
}

async function getQueryRecommendations(query, type) {
  const intent = await extractIntent(query);
  const catalog = await searchUnifiedCatalog(query, type);
  const top = catalog
    .map((item) => ({ ...item, relevance: scoreCandidate(item, intent, query) }))
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 40);
  return { intent, top };
}

export async function recommendations(req, res, next) {
  try {
    if (req.query.query) {
      const { intent, top } = await getQueryRecommendations(req.query.query, req.query.type);
      return res.json({
        ok: true,
        data: top,
        meta: { intent, fallback: !process.env.OPENAI_API_KEY }
      });
    }
    const items = await getRecommendations(req.user, req.query);
    res.json({ ok: true, data: items, meta: { fallback: !process.env.OPENAI_API_KEY } });
  } catch (error) {
    next(error);
  }
}

export async function trackInteraction(req, res, next) {
  try {
    const { contentId, action, value, metadata } = req.body;
    await updateUserFromInteraction(req.user._id, contentId, action, value, metadata);
    res.status(201).json({ ok: true });
  } catch (error) {
    next(error);
  }
}

export async function assistant(req, res, next) {
  try {
    const { top } = await getQueryRecommendations(req.body.prompt, req.body.type || 'all');
    const candidates = top.length ? top : await getRecommendations(req.user, { limit: 12, query: req.body.prompt });
    const result = await askRecommendationAssistant({ prompt: req.body.prompt, user: req.user, candidates });
    res.json({ ok: true, data: result.picks, answer: result.answer });
  } catch (error) {
    next(error);
  }
}

export async function randomPick(req, res, next) {
  try {
    if (tmdbAvailable()) {
      const pick = await fetchRandomTmdb(req.query.type, req.query.mood);
      if (pick) {
        return res.json({
          ok: true,
          pick,
          answer: `Tonight, we discovered ${pick.title} from ${pick.releaseYear || 'the past'}. It randomly popped up and looks genuinely unexpected!`
        });
      }
    }
    const pool = await getRecommendations(req.user, { ...req.query, limit: 200 });
    if (!pool.length) return res.status(404).json({ message: 'No recommendations available yet.' });
    const pick = pool[Math.floor(Math.random() * pool.length)];
    res.json({
      ok: true,
      pick,
      answer: `Tonight, go with ${pick.title}. ${pick.reason}`
    });
  } catch (error) {
    next(error);
  }
}
