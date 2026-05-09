import Content from '../models/Content.js';
import { buildContentVector } from '../utils/vector.js';
import { fetchTmdbCollection, fetchTmdbDetails, searchTmdbCatalog, tmdbAvailable } from './tmdbService.js';
import { searchOMDb, searchSpotify, searchTvMaze } from './externalApiService.js';

function dedupe(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.source}:${item.externalId || item.title}:${item.type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function upsertCatalogItems(items = []) {
  const results = [];
  for (const item of dedupe(items).filter((entry) => entry?.title && entry?.type)) {
    const query = item.externalId ? { externalId: item.externalId, source: item.source } : { title: item.title, type: item.type };
    const doc = await Content.findOneAndUpdate(
      query,
      { ...item, vector: buildContentVector(item) },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    results.push(doc);
  }
  return results;
}

export async function fetchAndStoreTmdbCatalog() {
  if (!tmdbAvailable()) return { imported: 0 };
  const [movieTrending, moviePopular, tvTrending] = await Promise.all([
    fetchTmdbCollection('trending', 'movie'),
    fetchTmdbCollection('popular', 'movie'),
    fetchTmdbCollection('trending', 'tv')
  ]);
  const stored = await upsertCatalogItems([...movieTrending, ...moviePopular, ...tvTrending]);
  return { imported: stored.length };
}

export async function getCatalogList({ type, source, limit = 20, sort = { popularity: -1, rating: -1 } } = {}) {
  const filter = {};
  if (type) filter.type = type;
  if (source) filter.source = source;
  return Content.find(filter).sort(sort).limit(limit);
}

export async function getTrendingMovies() {
  const imported = await fetchTmdbCollection('trending', 'movie');
  if (imported.length) await upsertCatalogItems(imported);
  return getCatalogList({ type: 'movie', limit: 20 });
}

export async function getPopularMovies() {
  const imported = await fetchTmdbCollection('popular', 'movie');
  if (imported.length) await upsertCatalogItems(imported);
  return getCatalogList({ type: 'movie', limit: 20 });
}

export async function getTrendingTv() {
  const imported = await fetchTmdbCollection('trending', 'tv');
  if (imported.length) await upsertCatalogItems(imported);
  return getCatalogList({ type: 'tv', limit: 20 });
}

export async function getMovieDetails(id) {
  let local = await Content.findById(id);
  if (local) {
    if (!local.externalId && tmdbAvailable()) {
      const results = await searchTmdbCatalog(local.title);
      const match = results.find((r) => r.type === local.type && r.title.toLowerCase() === local.title.toLowerCase());
      if (match) {
        local.externalId = match.externalId;
        local.source = 'tmdb';
        await local.save();
      }
    }

    if (local.source === 'tmdb' && local.externalId) {
      const details = await fetchTmdbDetails(local.externalId, local.type === 'tv' ? 'tv' : 'movie');
      if (details) {
        const [updated] = await upsertCatalogItems([{ ...local.toObject(), ...details, source: 'tmdb' }]);
        return updated;
      }
    }
    return local;
  }

  const tmdbDetails = await fetchTmdbDetails(id, 'movie');
  if (!tmdbDetails) return null;
  const [stored] = await upsertCatalogItems([tmdbDetails]);
  return stored;
}

export async function searchUnifiedCatalog(query, type = 'all') {
  const local = await Content.find(query ? { $text: { $search: query } } : {}).limit(30);
  const [tmdbImported, tvImported, movieImported, musicImported] = await Promise.all([
    searchTmdbCatalog(query).catch(() => []),
    type === 'tv' || type === 'all' ? searchTvMaze(query).catch(() => []) : [],
    type === 'movie' || type === 'all' ? searchOMDb(query).catch(() => []) : [],
    type === 'music' || type === 'all' ? searchSpotify(query).catch(() => []) : []
  ]);
  const storedImported = await upsertCatalogItems([...tmdbImported, ...tvImported, ...movieImported]);
  return dedupe([...local.map((item) => item.toObject()), ...storedImported.map((item) => item.toObject())])
    .filter((item) => type === 'all' || !type || item.type === type);
}
