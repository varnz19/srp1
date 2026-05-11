import axios from 'axios';

const tmdb = axios.create({ baseURL: 'https://api.themoviedb.org/3' });
const tvmaze = axios.create({ baseURL: 'https://api.tvmaze.com' });

const tmdbGenreIds = {
  Action: 28,
  Adventure: 12,
  Animation: 16,
  Comedy: 35,
  Crime: 80,
  Documentary: 99,
  Drama: 18,
  Fantasy: 14,
  Horror: 27,
  Mystery: 9648,
  Romance: 10749,
  'Sci-Fi': 878,
  Thriller: 53
};

function tmdbPoster(path) {
  return path ? `https://image.tmdb.org/t/p/w780${path}` : '';
}

function hasUsableKey(value) {
  return Boolean(value && !value.includes('your_') && !value.includes('paste_') && value !== 'replace-me');
}

export async function fetchTrendingFromTMDB(page = 1) {
  if (!hasUsableKey(process.env.TMDB_API_KEY)) return [];
  const { data } = await tmdb.get('/trending/all/week', {
    params: { api_key: process.env.TMDB_API_KEY, page }
  });
  return (data.results || []).filter((item) => item.media_type !== 'person').slice(0, 40).map((item) => ({
    externalId: String(item.id),
    source: 'tmdb',
    type: item.media_type === 'tv' ? 'tv' : 'movie',
    title: item.title || item.name,
    overview: item.overview,
    posterUrl: tmdbPoster(item.poster_path),
    backdropUrl: tmdbPoster(item.backdrop_path),
    releaseYear: Number((item.release_date || item.first_air_date || '').slice(0, 4)) || undefined,
    rating: item.vote_average,
    popularity: item.popularity,
    genres: mapTmdbGenres(item.genre_ids),
    tags: ['trending'],
    raw: item
  }));
}

export async function searchTMDB(query, type = 'multi') {
  if (!hasUsableKey(process.env.TMDB_API_KEY) || !query) return [];
  const { data } = await tmdb.get(`/search/${type}`, {
    params: { api_key: process.env.TMDB_API_KEY, query, include_adult: false }
  });
  return (data.results || []).filter((item) => item.media_type !== 'person').slice(0, 40).map((item) => ({
    externalId: String(item.id),
    source: 'tmdb',
    type: item.media_type === 'tv' ? 'tv' : 'movie',
    title: item.title || item.name,
    overview: item.overview,
    posterUrl: tmdbPoster(item.poster_path),
    backdropUrl: tmdbPoster(item.backdrop_path),
    releaseYear: Number((item.release_date || item.first_air_date || '').slice(0, 4)) || undefined,
    rating: item.vote_average,
    popularity: item.popularity,
    genres: mapTmdbGenres(item.genre_ids),
    tags: ['search-result'],
    raw: item
  }));
}

export async function discoverTMDB({ type = 'movie', genres = [], page = 1, mood, provider } = {}) {
  if (!hasUsableKey(process.env.TMDB_API_KEY)) return [];
  const endpoint = type === 'tv' ? '/discover/tv' : '/discover/movie';
  const genreIds = genres.map((genre) => tmdbGenreIds[genre]).filter(Boolean);
  const moodSort = mood === 'thrilling' || mood === 'happy' ? 'popularity.desc' : 'vote_average.desc';
  const moodGenreMap = {
    happy: [35, 16, 12, 10751],
    dark: [27, 80, 53],
    thrilling: [28, 53, 9648],
    emotional: [18, 10749],
    chill: [99, 35, 10402]
  };
  const moodGenres = moodGenreMap[mood] || [];
  const combinedGenres = [...new Set([...genreIds, ...moodGenres])];

  const { data } = await tmdb.get(endpoint, {
    params: {
      api_key: process.env.TMDB_API_KEY,
      include_adult: false,
      page,
      sort_by: moodSort,
      'vote_count.gte': 150,
      with_genres: combinedGenres.join(',') || undefined,
      with_watch_providers: provider || undefined,
      watch_region: provider ? 'IN' : undefined
    }
  });
  return (data.results || []).slice(0, 40).map((item) => ({
    externalId: String(item.id),
    source: 'tmdb',
    type,
    title: item.title || item.name,
    overview: item.overview,
    posterUrl: tmdbPoster(item.poster_path),
    backdropUrl: tmdbPoster(item.backdrop_path),
    releaseYear: Number((item.release_date || item.first_air_date || '').slice(0, 4)) || undefined,
    rating: item.vote_average,
    popularity: item.popularity,
    genres: mapTmdbGenres(item.genre_ids),
    tags: ['discovered', mood].filter(Boolean),
    raw: item
  }));
}

function mapTmdbGenres(ids = []) {
  const entries = Object.entries(tmdbGenreIds);
  return ids.map((id) => entries.find(([, value]) => value === id)?.[0]).filter(Boolean);
}

function stripHtml(value = '') {
  return String(value).replace(/<[^>]*>/g, '').trim();
}

function mapTvMazeShow(show, tags = []) {
  return {
    externalId: String(show.id),
    source: 'tvmaze',
    type: 'tv',
    title: show.name,
    overview: stripHtml(show.summary) || `${show.name} is a ${show.type || 'series'} from TVMaze.`,
    posterUrl: show.image?.original || show.image?.medium || '',
    backdropUrl: show.image?.original || '',
    releaseYear: Number((show.premiered || '').slice(0, 4)) || undefined,
    durationMinutes: show.averageRuntime || show.runtime,
    rating: show.rating?.average || 0,
    popularity: Math.round((show.weight || 0) + (show.rating?.average || 0) * 8),
    genres: show.genres || [],
    tags: ['tvmaze', ...tags],
    people: [],
    directors: [],
    cast: [],
    platforms: show.network?.name ? [show.network.name] : [],
    language: show.language,
    raw: show
  };
}

export async function fetchTvMazeTrending() {
  const { data } = await tvmaze.get('/shows');
  return (data || [])
    .sort((a, b) => (b.weight || 0) + (b.rating?.average || 0) * 10 - ((a.weight || 0) + (a.rating?.average || 0) * 10))
    .slice(0, 40)
    .map((show) => mapTvMazeShow(show, ['trending']));
}

export async function searchTvMaze(query) {
  if (!query) return [];
  const { data } = await tvmaze.get('/search/shows', { params: { q: query } });
  return (data || []).slice(0, 30).map((result) => mapTvMazeShow(result.show, ['search-result']));
}

export async function discoverTvMaze({ genres = [], mood } = {}) {
  const shows = await fetchTvMazeTrending();
  const wanted = new Set((genres || []).map((genre) => genre.toLowerCase()));
  const filtered = shows.filter((show) => {
    if (!wanted.size) return true;
    return (show.genres || []).some((genre) => wanted.has(genre.toLowerCase()));
  });
  return (filtered.length ? filtered : shows).map((show) => ({
    ...show,
    tags: [...new Set([...(show.tags || []), 'discovered', mood].filter(Boolean))]
  }));
}

export async function searchOMDb(query) {
  if (!hasUsableKey(process.env.OMDB_API_KEY) || !query) return [];
  const { data } = await axios.get('https://www.omdbapi.com/', {
    params: { apikey: process.env.OMDB_API_KEY, s: query, type: 'movie' }
  });
  if (!Array.isArray(data.Search)) return [];
  return Promise.all(
    data.Search.slice(0, 20).map(async (result) => {
      const detail = await axios
        .get('https://www.omdbapi.com/', { params: { apikey: process.env.OMDB_API_KEY, i: result.imdbID, plot: 'short' } })
        .then((response) => response.data)
        .catch(() => result);
      return {
        externalId: result.imdbID,
        source: 'omdb',
        type: detail.Type === 'series' ? 'tv' : 'movie',
        title: detail.Title || result.Title,
        overview: detail.Plot && detail.Plot !== 'N/A' ? detail.Plot : '',
        posterUrl: detail.Poster && detail.Poster !== 'N/A' ? detail.Poster : '',
        releaseYear: Number(detail.Year?.slice(0, 4)) || undefined,
        durationMinutes: Number(detail.Runtime?.match(/\d+/)?.[0]) || undefined,
        rating: Number(detail.imdbRating) || 0,
        popularity: Number(detail.imdbVotes?.replace(/,/g, '')) ? Math.min(Number(detail.imdbVotes.replace(/,/g, '')) / 10000, 100) : 45,
        genres: detail.Genre ? detail.Genre.split(',').map((entry) => entry.trim()) : [],
        tags: ['omdb', 'imdb-style', 'search-result'],
        people: [detail.Director, detail.Actors].filter(Boolean).join(', ').split(',').map((entry) => entry.trim()).filter(Boolean),
        directors: detail.Director && detail.Director !== 'N/A' ? detail.Director.split(',').map((entry) => entry.trim()) : [],
        cast: detail.Actors && detail.Actors !== 'N/A' ? detail.Actors.split(',').map((entry) => entry.trim()) : [],
        raw: detail
      };
    })
  );
}

export async function searchYouTubeTrailer(title) {
  if (!process.env.YOUTUBE_API_KEY || !title) return '';
  const { data } = await axios.get('https://www.googleapis.com/youtube/v3/search', {
    params: {
      key: process.env.YOUTUBE_API_KEY,
      q: `${title} official trailer`,
      part: 'snippet',
      type: 'video',
      maxResults: 1
    }
  });
  const videoId = data.items?.[0]?.id?.videoId;
  return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
}

let spotifyToken = null;
let spotifyExpires = 0;

async function getSpotifyToken() {
  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) return null;
  if (spotifyToken && Date.now() < spotifyExpires) return spotifyToken;
  const body = new URLSearchParams({ grant_type: 'client_credentials' });
  const { data } = await axios.post('https://accounts.spotify.com/api/token', body, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  spotifyToken = data.access_token;
  spotifyExpires = Date.now() + data.expires_in * 900;
  return spotifyToken;
}

export async function searchSpotify(query) {
  const token = await getSpotifyToken();
  if (!token || !query) return [];
  const { data } = await axios.get('https://api.spotify.com/v1/search', {
    headers: { Authorization: `Bearer ${token}` },
    params: { q: query, type: 'album,track,artist', limit: 12 }
  });
  const tracks = data.tracks?.items || [];
  return tracks.map((track) => ({
    externalId: track.id,
    source: 'spotify',
    type: 'music',
    title: track.name,
    overview: `${track.artists.map((a) => a.name).join(', ')} from ${track.album.name}`,
    posterUrl: track.album.images?.[0]?.url,
    releaseYear: Number((track.album.release_date || '').slice(0, 4)) || undefined,
    rating: Math.min(track.popularity / 10, 10),
    popularity: track.popularity,
    genres: ['Music'],
    tags: ['spotify', 'track'],
    people: track.artists.map((a) => a.name),
    artists: track.artists.map((a) => a.name),
    tracks: [track.name],
    albumType: 'track',
    raw: track
  }));
}
