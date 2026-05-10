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
    .slice(0, 2)
    .map((person) => ({ name: person.name, profileUrl: posterUrl(person.profile_path, 'w185') }));
  const cast = (credits?.cast || []).slice(0, 6).map((person) => ({ name: person.name, profileUrl: posterUrl(person.profile_path, 'w185') }));
  const trailer = (videos?.results || []).find((video) => video.site === 'YouTube' && video.type === 'Trailer');
  const inProviders = (providers?.results?.IN?.flatrate || []).map(p => p.provider_name);
  const inFree = (providers?.results?.IN?.free || []).map(p => p.provider_name);
  const usProviders = (providers?.results?.US?.flatrate || []).map(p => p.provider_name);
  const providerNames = [...new Set([...inProviders, ...inFree, ...usProviders])].filter(Boolean);

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
    people: [...new Set([...directors.map(d=>d.name), ...cast.map(c=>c.name)])],
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

const genreKeywordMap = {
  action: 28, adventure: 12, animation: 16, anime: 16, comedy: 35, crime: 80,
  documentary: 99, drama: 18, family: 10751, fantasy: 14, history: 36, horror: 27,
  music: 10402, mystery: 9648, romance: 10749, scifi: 878, 'sci-fi': 878, thriller: 53,
  war: 10752, western: 37
};

const languageMap = {
  korean: 'ko', kdrama: 'ko', telugu: 'te', hindi: 'hi', spanish: 'es',
  french: 'fr', japanese: 'ja', tamil: 'ta', english: 'en', malayalam: 'ml'
};

export async function searchTmdbCatalog(query) {
  return withCache(`tmdb:search:smart:${query}`, async () => {
    if (!hasKey() || !query) return [];
    const [movieGenres, tvGenres] = await Promise.all([getGenres('movie'), getGenres('tv')]);
    
    let q = query.toLowerCase();
    let with_genres = [];
    let with_original_language = '';
    let isTv = q.includes('series') || q.includes('show') || q.includes('drama') || q.includes('kdrama');
    
    if (q.includes('anime')) with_original_language = 'ja';

    for (const [key, val] of Object.entries(languageMap)) {
      if (q.includes(key)) {
        with_original_language = val;
        q = q.replace(key, '').trim();
      }
    }
    
    for (const [key, val] of Object.entries(genreKeywordMap)) {
      if (q.includes(key)) {
        with_genres.push(val);
        q = q.replace(key, '').trim();
      }
    }
    
    q = q.replace(/(series|show|movie|film|kdrama)/g, '').trim();
    
    let results = [];
    
    if (q.length < 2 && (with_genres.length > 0 || with_original_language)) {
      const discoverParams = {
        sort_by: 'popularity.desc',
        with_genres: with_genres.join(',') || undefined,
        with_original_language: with_original_language || undefined
      };
      
      const endpoints = isTv ? ['/discover/tv'] : ['/discover/movie', '/discover/tv'];
      const responses = await Promise.all(endpoints.map(ep => tmdbGet(ep, discoverParams)));
      
      responses.forEach((data, i) => {
        const type = endpoints[i].includes('tv') ? 'tv' : 'movie';
        const norm = (data?.results || []).map(item => normalizeTmdbItem(item, type, type === 'tv' ? tvGenres : movieGenres));
        results.push(...norm);
      });
      
      results.sort((a, b) => b.popularity - a.popularity);
    } else {
      const data = await tmdbGet('/search/multi', { query, include_adult: false });
      results = (data?.results || []).flatMap((item) => {
        if (item.media_type === 'person' && item.known_for) {
          return item.known_for
            .filter((kf) => ['movie', 'tv'].includes(kf.media_type))
            .map((kf) => normalizeTmdbItem(kf, 'multi', kf.media_type === 'tv' ? tvGenres : movieGenres));
        }
        if (['movie', 'tv'].includes(item.media_type)) {
          return [normalizeTmdbItem(item, 'multi', item.media_type === 'tv' ? tvGenres : movieGenres)];
        }
        return [];
      });
    }
    
    return results.slice(0, 30);
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

export async function fetchRandomTmdb(type = 'all', mood = '') {
  if (!hasKey()) return null;
  const isTv = type === 'tv' || (type === 'all' && Math.random() > 0.5);
  const endpoint = isTv ? '/discover/tv' : '/discover/movie';
  const [movieGenres, tvGenres] = await Promise.all([getGenres('movie'), getGenres('tv')]);
  const genreMap = isTv ? tvGenres : movieGenres;
  
  const year = Math.floor(Math.random() * (2023 - 1990 + 1)) + 1990;
  const genreIds = Array.from(genreMap.keys());
  let genre = genreIds[Math.floor(Math.random() * genreIds.length)];
  
  if (mood === 'happy') genre = 35; // comedy
  if (mood === 'dark') genre = isTv ? 9648 : 27; // mystery/horror
  if (mood === 'thrilling') genre = 53; // thriller
  if (mood === 'emotional') genre = 18; // drama
  if (mood === 'chill') genre = 10751; // family
  
  const page = Math.floor(Math.random() * 10) + 1;
  const params = {
    with_genres: genre,
    page,
    sort_by: 'popularity.desc',
    'vote_count.gte': 50
  };
  
  if (isTv) params.first_air_date_year = year;
  else params.primary_release_year = year;
  
  const data = await tmdbGet(endpoint, params);
  const results = data?.results || [];
  if (results.length === 0) return null;
  
  const item = results[Math.floor(Math.random() * results.length)];
  return normalizeTmdbItem(item, isTv ? 'tv' : 'movie', genreMap);
}

export async function fetchNewReleases() {
  return withCache(`tmdb:new_releases`, async () => {
    if (!hasKey()) return [];
    const [movieGenres, tvGenres] = await Promise.all([getGenres('movie'), getGenres('tv')]);
    
    const [movies, tv] = await Promise.all([
      tmdbGet('/movie/now_playing'),
      tmdbGet('/tv/on_the_air')
    ]);
    
    const m = (movies?.results || []).map(i => normalizeTmdbItem(i, 'movie', movieGenres));
    const t = (tv?.results || []).map(i => normalizeTmdbItem(i, 'tv', tvGenres));
    
    const all = [...m, ...t].sort((a, b) => b.popularity - a.popularity);
    return all.slice(0, 10);
  }, cacheTtl);
}

export function tmdbAvailable() {
  return hasKey();
}
