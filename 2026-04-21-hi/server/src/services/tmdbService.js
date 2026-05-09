import axios from 'axios';
import { withCache } from './cacheService.js';

const tmdb = axios.create({ baseURL: 'https://api.themoviedb.org/3' });
const cacheTtl = 1000 * 60 * 30;

const genreState = {
  movie: null,
  tv: null
};

function hasKey() {
  const key = process.env.TMDB_API_KEY;
  return Boolean(key && !key.includes('your_') && !key.includes('paste_'));
}

function posterUrl(path, size = 'w780') {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : '';
}

async function tmdbGet(path, params = {}) {
  if (!hasKey()) return null;
  const { data } = await tmdb.get(path, {
    params: {
      api_key: process.env.TMDB_API_KEY,
      ...params
    }
  });
  return data;
}

async function getGenres(type) {
  if (genreState[type]) return genreState[type];
  const endpoint = type === 'tv' ? '/genre/tv/list' : '/genre/movie/list';
  const data = await tmdbGet(endpoint);
  const map = new Map((data?.genres || []).map((genre) => [genre.id, genre.name]));
  genreState[type] = map;
  return map;
}

function normalizeTmdbItem(item, type, genres) {
  const itemType = type === 'multi' ? (item.media_type === 'tv' ? 'tv' : 'movie') : type;
  const releaseDate = item.release_date || item.first_air_date || '';
  return {
    externalId: String(item.id),
    source: 'tmdb',
    type: itemType,
    title: item.title || item.name,
    overview: item.overview || '',
    posterUrl: posterUrl(item.poster_path),
    backdropUrl: posterUrl(item.backdrop_path, 'w1280'),
    releaseYear: Number(releaseDate.slice(0, 4)) || undefined,
    rating: item.vote_average || 0,
    popularity: item.popularity || 0,
    genres: (item.genre_ids || []).map((id) => genres.get(id)).filter(Boolean),
    tags: [],
    people: [],
    directors: [],
    cast: [],
    platforms: [],
    raw: item
  };
}

function normalizeTmdbDetails(details, credits, videos, providers, type) {
  const directors = (credits?.crew || [])
    .filter((person) => person.job === 'Director' || person.job === 'Creator')
    .slice(0, 4)
    .map((person) => person.name);
  const cast = (credits?.cast || []).slice(0, 12).map((person) => person.name);
  const trailer = (videos?.results || []).find((video) => video.site === 'YouTube' && video.type === 'Trailer');
  const providerNames = Object.values({
    ...(providers?.results?.IN?.flatrate || {}),
    ...(providers?.results?.US?.flatrate || {}),
    ...(providers?.results?.GB?.flatrate || {})
  })
    .map((provider) => provider.provider_name)
    .filter(Boolean);

  return {
    externalId: String(details.id),
    source: 'tmdb',
    type,
    title: details.title || details.name,
    overview: details.overview || '',
    posterUrl: posterUrl(details.poster_path),
    backdropUrl: posterUrl(details.backdrop_path, 'w1280'),
    trailerUrl: trailer ? `https://www.youtube.com/embed/${trailer.key}` : '',
    releaseYear: Number((details.release_date || details.first_air_date || '').slice(0, 4)) || undefined,
    durationMinutes: details.runtime || details.episode_run_time?.[0],
    rating: details.vote_average || 0,
    popularity: details.popularity || 0,
    genres: (details.genres || []).map((genre) => genre.name),
    tags: ['tmdb-detail'],
    people: [...new Set([...directors, ...cast])],
    directors,
    cast,
    platforms: [...new Set(providerNames)],
    language: details.original_language,
    raw: { details, credits, videos, providers }
  };
}

export async function fetchTmdbCollection(kind, type, page = 1) {
  return withCache(`tmdb:${kind}:${type}:${page}`, async () => {
    if (!hasKey()) return [];
    const genreMap = await getGenres(type);
    const path = type === 'tv'
      ? kind === 'trending'
        ? '/trending/tv/week'
        : '/tv/popular'
      : kind === 'trending'
        ? '/trending/movie/week'
        : '/movie/popular';
    const data = await tmdbGet(path, { page });
    return (data?.results || []).slice(0, 20).map((item) => normalizeTmdbItem(item, type, genreMap));
  }, cacheTtl);
}

export async function searchTmdbCatalog(query) {
  return withCache(`tmdb:search:${query}`, async () => {
    if (!hasKey() || !query) return [];
    const [movieGenres, tvGenres] = await Promise.all([getGenres('movie'), getGenres('tv')]);
    const data = await tmdbGet('/search/multi', { query, include_adult: false });
    return (data?.results || [])
      .filter((item) => ['movie', 'tv'].includes(item.media_type))
      .slice(0, 30)
      .map((item) => normalizeTmdbItem(item, 'multi', item.media_type === 'tv' ? tvGenres : movieGenres));
  }, cacheTtl);
}

export async function fetchTmdbDetails(id, type = 'movie') {
  return withCache(`tmdb:details:${type}:${id}`, async () => {
    if (!hasKey()) return null;
    const [details, credits, videos, providers] = await Promise.all([
      tmdbGet(`/${type}/${id}`),
      tmdbGet(`/${type}/${id}/credits`),
      tmdbGet(`/${type}/${id}/videos`),
      tmdbGet(`/${type}/${id}/watch/providers`)
    ]);
    if (!details) return null;
    return normalizeTmdbDetails(details, credits, videos, providers, type);
  }, cacheTtl);
}

export function tmdbAvailable() {
  return hasKey();
}
