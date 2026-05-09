import { getMovieDetails, getPopularMovies, getTrendingMovies, getTrendingTv } from '../services/catalogService.js';

function ok(res, data, meta = {}) {
  res.json({ ok: true, data, meta });
}

export async function trendingMovies(req, res, next) {
  try {
    const items = await getTrendingMovies();
    ok(res, items, { source: 'movies.trending' });
  } catch (error) {
    next(error);
  }
}

export async function popularMovies(req, res, next) {
  try {
    const items = await getPopularMovies();
    ok(res, items, { source: 'movies.popular' });
  } catch (error) {
    next(error);
  }
}

export async function trendingTv(req, res, next) {
  try {
    const items = await getTrendingTv();
    ok(res, items, { source: 'tv.trending' });
  } catch (error) {
    next(error);
  }
}

export async function movieDetails(req, res, next) {
  try {
    const item = await getMovieDetails(req.params.id);
    if (!item) return res.status(404).json({ ok: false, message: 'Movie not found' });
    ok(res, item, { source: 'movies.details' });
  } catch (error) {
    next(error);
  }
}
