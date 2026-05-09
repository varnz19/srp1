import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootPath = path.resolve(__dirname, '..');

async function replaceInFile(filePath, replacements) {
  try {
    let content = await fs.readFile(filePath, 'utf-8');
    for (const { from, to } of replacements) {
      if (typeof from === 'string') {
        content = content.split(from).join(to);
      } else {
        content = content.replace(from, to);
      }
    }
    await fs.writeFile(filePath, content, 'utf-8');
    console.log(`Updated ${filePath}`);
  } catch (e) {
    console.error(`Error updating ${filePath}:`, e.message);
  }
}

async function removeMusic() {
  const cPaths = {
    auth: path.join(rootPath, 'client', 'src', 'pages', 'AuthPage.jsx'),
    dash: path.join(rootPath, 'client', 'src', 'pages', 'Dashboard.jsx'),
    mood: path.join(rootPath, 'client', 'src', 'pages', 'MoodPage.jsx'),
    onboard: path.join(rootPath, 'client', 'src', 'pages', 'Onboarding.jsx'),
    profile: path.join(rootPath, 'client', 'src', 'pages', 'ProfilePage.jsx'),
    random: path.join(rootPath, 'client', 'src', 'pages', 'RandomPage.jsx'),
    search: path.join(rootPath, 'client', 'src', 'pages', 'SearchPage.jsx'),
    trending: path.join(rootPath, 'client', 'src', 'pages', 'TrendingPage.jsx'),
    details: path.join(rootPath, 'client', 'src', 'pages', 'DetailsPage.jsx'),
    content: path.join(rootPath, 'server', 'src', 'models', 'Content.js'),
    catalog: path.join(rootPath, 'server', 'src', 'services', 'catalogService.js'),
    controller: path.join(rootPath, 'server', 'src', 'controllers', 'contentController.js'),
    seed: path.join(rootPath, 'server', 'src', 'seed.js'),
    external: path.join(rootPath, 'server', 'src', 'services', 'externalApiService.js')
  };

  await replaceInFile(cPaths.auth, [{ from: 'Movies, shows, anime, and music', to: 'Movies, shows, and anime' }]);
  
  const arrayReplacements = [
    { from: "['all', 'movie', 'tv', 'anime', 'music']", to: "['all', 'movie', 'tv', 'anime']" },
    { from: "['all', 'tv', 'movie', 'anime', 'music']", to: "['all', 'tv', 'movie', 'anime']" },
    { from: "['movie', 'tv', 'anime', 'music']", to: "['movie', 'tv', 'anime']" }
  ];
  
  await replaceInFile(cPaths.dash, arrayReplacements);
  await replaceInFile(cPaths.mood, arrayReplacements);
  await replaceInFile(cPaths.random, arrayReplacements);
  await replaceInFile(cPaths.search, arrayReplacements);
  await replaceInFile(cPaths.trending, arrayReplacements);
  await replaceInFile(cPaths.onboard, arrayReplacements);

  await replaceInFile(cPaths.profile, [
    ...arrayReplacements,
    { from: "  { name: 'Spotify', url: 'https://open.spotify.com' },\n", to: "" },
    { from: "  { name: 'Apple Music', url: 'https://music.apple.com' }\n", to: "" },
    { from: "  { name: 'Crunchyroll', url: 'https://www.crunchyroll.com' },\n", to: "  { name: 'Crunchyroll', url: 'https://www.crunchyroll.com' }\n" }, // remove trailing comma
  ]);

  // Handle DetailsPage.jsx
  await replaceInFile(cPaths.details, [
    { from: "import { ArrowLeft, Bookmark, CheckCircle, Heart, Mic2, Music2, UsersRound, Video } from 'lucide-react';", to: "import { ArrowLeft, Bookmark, CheckCircle, Heart, Mic2, UsersRound, Video } from 'lucide-react';" },
    { from: "const directors = content.directors?.length ? content.directors : content.type === 'music' ? [] : (content.people || []).slice(0, 1);", to: "const directors = content.directors?.length ? content.directors : (content.people || []).slice(0, 1);" },
    { from: "const cast = content.cast?.length ? content.cast : content.type === 'music' ? [] : (content.people || []).slice(1);", to: "const cast = content.cast?.length ? content.cast : (content.people || []).slice(1);" },
    { from: "const artists = content.artists?.length ? content.artists : content.type === 'music' ? content.people || [] : [];\n  const tracks = content.tracks?.length ? content.tracks : content.type === 'music' ? [content.title] : [];", to: "" },
    { from: "{content.type !== 'music' && (", to: "(true && (" },
    { from: /\{content\.type === 'music'[\s\S]*?(?=\s*\{content\.tags)/, to: "" },
  ]);

  // Handle backend files
  await replaceInFile(cPaths.content, [
    { from: "['movie', 'tv', 'anime', 'music']", to: "['movie', 'tv', 'anime']" },
    { from: "artists: [String],\n    tracks: [String],\n    albumType: String,\n", to: "" },
    { from: "enum: ['seed', 'tmdb', 'spotify', 'youtube', 'tvmaze', 'omdb']", to: "enum: ['seed', 'tmdb', 'youtube', 'tvmaze', 'omdb']" }
  ]);

  await replaceInFile(cPaths.catalog, [
    { from: "searchOMDb,\n  searchSpotify,\n", to: "searchOMDb,\n" },
    { from: "searchSpotify,\n", to: "" },
    { from: "const [tmdbImported, tvImported, movieImported, musicImported] = await Promise.all([\n      searchTMDB(query).catch(() => []),\n      type === 'tv' || type === 'all' || !type ? searchTvMaze(query).catch(() => []) : [],\n      type === 'movie' || type === 'all' || !type ? searchOMDb(query).catch(() => []) : [],\n      type === 'music' || type === 'all' ? searchSpotify(query).catch(() => []) : []\n    ]);", to: "const [tmdbImported, tvImported, movieImported] = await Promise.all([\n      searchTMDB(query).catch(() => []),\n      type === 'tv' || type === 'all' || !type ? searchTvMaze(query).catch(() => []) : [],\n      type === 'movie' || type === 'all' || !type ? searchOMDb(query).catch(() => []) : []\n    ]);" },
    { from: "const storedImported = await upsertCatalogItems([...tmdbImported, ...tvImported, ...movieImported, ...musicImported]);", to: "const storedImported = await upsertCatalogItems([...tmdbImported, ...tvImported, ...movieImported]);" }
  ]);

  await replaceInFile(cPaths.controller, [
    { from: "searchOMDb,\n  searchSpotify,\n", to: "searchOMDb,\n" },
    { from: "searchSpotify,\n", to: "" },
    { from: "const [tmdbResults, tvMazeResults, omdbResults, spotifyResults] = await Promise.all([\n      searchTMDB(q, type === 'movie' || type === 'tv' ? type : 'multi').catch(() => []),\n      type === 'tv' || type === 'all' || !type ? searchTvMaze(q).catch(() => []) : [],\n      type === 'movie' || type === 'all' || !type ? searchOMDb(q).catch(() => []) : [],\n      type === 'music' || type === 'all' || !type ? searchSpotify(q).catch(() => []) : []\n    ]);", to: "const [tmdbResults, tvMazeResults, omdbResults] = await Promise.all([\n      searchTMDB(q, type === 'movie' || type === 'tv' ? type : 'multi').catch(() => []),\n      type === 'tv' || type === 'all' || !type ? searchTvMaze(q).catch(() => []) : [],\n      type === 'movie' || type === 'all' || !type ? searchOMDb(q).catch(() => []) : []\n    ]);" },
    { from: "const imported = await upsertExternalItems([...tmdbResults, ...tvMazeResults, ...omdbResults, ...spotifyResults]);", to: "const imported = await upsertExternalItems([...tmdbResults, ...tvMazeResults, ...omdbResults]);" }
  ]);

  await replaceInFile(cPaths.seed, [
    { from: "['tv', 'music']", to: "['tv']" }
  ]);

  // Read seedContent.js, filter out music, write back
  const seedPath = path.join(rootPath, 'server', 'src', 'data', 'seedContent.js');
  const { seedContent } = await import('./src/data/seedContent.js');
  const filteredSeed = seedContent.filter(item => item.type !== 'music');
  const fileContent = `export const seedContent = ${JSON.stringify(filteredSeed, null, 2)};\n`;
  await fs.writeFile(seedPath, fileContent, 'utf-8');
  console.log('Filtered out music from seedContent.js');
}

removeMusic().catch(console.error);
