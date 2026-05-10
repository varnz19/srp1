import Content from '../models/Content.js';
import Watchlist from '../models/Watchlist.js';
import {
  discoverTMDB,
  discoverTvMaze,
  fetchTrendingFromTMDB,
  fetchTvMazeTrending,
  searchOMDb,
  searchTMDB,
  searchTvMaze,
  searchYouTubeTrailer
} from '../services/externalApiService.js';
import { getSimilarContent, updateUserFromInteraction } from '../services/recommendationService.js';
import { buildContentVector } from '../utils/vector.js';
import { getMovieDetails, searchUnifiedCatalog } from '../services/catalogService.js';
import { fetchNewReleases } from '../services/tmdbService.js';

export async function newReleases(req, res, next) {
  try {
    const items = await fetchNewReleases();
    const imported = await upsertExternalItems(items);
    res.json({ newReleases: imported });
  } catch (error) {
    next(error);
  }
}

export async function listContent(req, res, next) {
  try {
    const { q, type, genre, page = 1, limit = 60 } = req.query;
    const filter = {};
    if (type && type !== 'all') filter.type = type;
    if (genre) filter.genres = genre;
    if (q) filter.$text = { $search: q };
    const content = await Content.find(filter)
      .sort({ popularity: -1, rating: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    res.json({ content });
  } catch (error) {
    next(error);
  }
}

async function upsertExternalItems(items = []) {
  const saved = [];
  for (const item of items.filter((entry) => entry.title && entry.type)) {
    const query = item.externalId ? { externalId: item.externalId, source: item.source } : { title: item.title, type: item.type };
    const content = await Content.findOneAndUpdate(
      query,
      { ...item, vector: buildContentVector(item) },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    saved.push(content);
  }
  return saved;
}

export async function getContentDetails(req, res, next) {
  try {
    let content = await Content.findById(req.params.id);
    if (!content) return res.status(404).json({ message: 'Content not found' });
    if (content.source === 'tmdb' && content.externalId) {
      content = await getMovieDetails(content._id) || content;
    }
    if (!content.trailerUrl) {
      content.trailerUrl = await searchYouTubeTrailer(content.title);
      await content.save();
    }
    await updateUserFromInteraction(req.user._id, content._id, 'view');
    const similar = await getSimilarContent(content._id);
    res.json({ content, similar, becauseYouLiked: similar.slice(0, 4) });
  } catch (error) {
    next(error);
  }
}

export async function searchContent(req, res, next) {
  try {
    const { q, type } = req.query;
    const local = await Content.find(q ? { $text: { $search: q } } : {}).limit(20);
    const [tmdbResults, tvMazeResults, omdbResults] = await Promise.all([
      searchTMDB(q, type === 'movie' || type === 'tv' ? type : 'multi').catch(() => []),
      type === 'tv' || type === 'all' || !type ? searchTvMaze(q).catch(() => []) : [],
      type === 'movie' || type === 'all' || !type ? searchOMDb(q).catch(() => []) : []
    ]);
    const imported = await upsertExternalItems([...tmdbResults, ...tvMazeResults, ...omdbResults]);
    const unified = q ? await searchUnifiedCatalog(q, type) : [...local.map((item) => item.toObject()), ...imported.map((item) => item.toObject())];
    res.json({ results: unified });
  } catch (error) {
    next(error);
  }
}

export async function trending(req, res, next) {
  try {
    const { type = 'all', page } = req.query;
    const targetPage = parseInt(page) || Math.floor(Math.random() * 5) + 1;
    const [tmdbExternal, tvMazeExternal] = await Promise.all([
      type === 'all' || type === 'movie' || type === 'tv' ? fetchTrendingFromTMDB(targetPage).catch(() => []) : [],
      type === 'all' || type === 'tv' ? fetchTvMazeTrending().catch(() => []) : []
    ]);
    const external = [...tmdbExternal, ...tvMazeExternal];
    if (external.length) {
      const imported = await upsertExternalItems(external);
      return res.json({ trending: imported.sort((a, b) => b.popularity - a.popularity) });
    }
    const filter = type === 'all' ? {} : { type };
    const local = await Content.find(filter).sort({ popularity: -1, rating: -1 }).limit(40);
    res.json({ trending: local });
  } catch (error) {
    next(error);
  }
}

export async function discoverContent(req, res, next) {
  try {
    const { type = 'movie', mood, page = 1 } = req.query;
    const genres = req.user.preferences?.genres || [];
    const tmdbTypes = type === 'all' ? ['movie', 'tv'] : [type].filter((item) => ['movie', 'tv'].includes(item));
    const externalBatches = await Promise.all([
      ...tmdbTypes.map((entryType) => discoverTMDB({ type: entryType, genres, mood, page }).catch(() => [])),
      type === 'tv' || type === 'all' ? discoverTvMaze({ genres, mood }).catch(() => []) : []
    ]);
    const imported = await upsertExternalItems(externalBatches.flat());
    const fallback = await Content.find(type && type !== 'all' ? { type } : {}).sort({ updatedAt: -1, popularity: -1 }).limit(40);
    res.json({ content: imported.length ? imported : fallback, imported: imported.length });
  } catch (error) {
    next(error);
  }
}

export async function importExternalContent(req, res, next) {
  try {
    const item = req.body;
    const existing = item.externalId ? await Content.findOne({ externalId: item.externalId, source: item.source }) : null;
    if (existing) return res.json({ content: existing });
    const content = await Content.create({ ...item, vector: buildContentVector(item) });
    res.status(201).json({ content });
  } catch (error) {
    next(error);
  }
}

export async function byPlatform(req, res, next) {
  try {
    const { provider } = req.query;
    const [movies, tvs] = await Promise.all([
      discoverTMDB({ type: 'movie', provider }).catch(() => []),
      discoverTMDB({ type: 'tv', provider }).catch(() => [])
    ]);
    const external = [...movies, ...tvs].sort((a, b) => b.popularity - a.popularity).slice(0, 8);
    const imported = await upsertExternalItems(external);
    res.json({ data: imported });
  } catch (error) {
    next(error);
  }
}

export async function updateWatchlist(req, res, next) {
  try {
    const { contentId, status = 'saved' } = req.body;
    const entry = await Watchlist.findOneAndUpdate(
      { user: req.user._id, content: contentId },
      { status },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate('content');
    const action = status === 'dismissed' ? 'dismiss' : status === 'favorite' ? 'favorite' : status === 'completed' ? 'complete' : 'save';
    await updateUserFromInteraction(req.user._id, contentId, action);
    res.json({ entry });
  } catch (error) {
    next(error);
  }
}

export async function getWatchlist(req, res, next) {
  try {
    const entries = await Watchlist.find({ user: req.user._id }).populate('content').sort({ updatedAt: -1 });
    res.json({ entries });
  } catch (error) {
    next(error);
  }
}
