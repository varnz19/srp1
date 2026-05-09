import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedFilePath = path.join(__dirname, 'src', 'data', 'seedContent.js');

const newItems = [
  // Telugu Movies
  { type: 'movie', title: 'Dacoit: A Love Story', overview: 'A raw and intense love story set against a violent backdrop.', genres: ['Action', 'Romance'], language: 'Telugu', tags: ['trending', 'telugu', 'intense'] },
  { type: 'movie', title: 'Ranabaali', overview: 'An epic tale of revenge and survival.', genres: ['Action', 'Drama'], language: 'Telugu', tags: ['trending', 'telugu', 'epic'] },
  { type: 'movie', title: 'Anaganaga Oka Raju', overview: 'A hilarious action-comedy about an aspiring kingpin.', genres: ['Action', 'Comedy'], language: 'Telugu', tags: ['trending', 'telugu', 'fun'] },
  { type: 'movie', title: 'Raakaasaa', overview: 'A gripping thriller filled with suspense.', genres: ['Thriller'], language: 'Telugu', tags: ['trending', 'telugu', 'dark'] },
  { type: 'movie', title: 'Gaaya Padda Simham', overview: 'A wounded lion returns for retribution.', genres: ['Action'], language: 'Telugu', tags: ['trending', 'telugu', 'revenge'] },
  { type: 'movie', title: 'Euphoria', overview: 'A deep emotional journey of self-discovery.', genres: ['Drama'], language: 'Telugu', tags: ['trending', 'telugu', 'emotional'] },
  { type: 'movie', title: 'Mrithyunjay', overview: 'A high-octane action thriller.', genres: ['Action', 'Thriller'], language: 'Telugu', tags: ['trending', 'telugu', 'fast-paced'] },
  { type: 'movie', title: 'Hey Balwanth', overview: 'An inspiring story of strength and courage.', genres: ['Action', 'Drama'], language: 'Telugu', tags: ['trending', 'telugu', 'inspiring'] },
  { type: 'movie', title: 'Nari Nari Naduma Murari', overview: 'A light-hearted romantic comedy.', genres: ['Romance', 'Comedy'], language: 'Telugu', tags: ['trending', 'telugu', 'feel-good'] },
  { type: 'movie', title: 'Mana ShankaraVaraprasad Garu', overview: 'A family drama centering on legacy and values.', genres: ['Drama', 'Comedy'], language: 'Telugu', tags: ['trending', 'telugu', 'family'] },

  // English Movies
  { type: 'movie', title: 'The Drama', overview: 'A suspenseful look into the theatrical world.', genres: ['Drama', 'Thriller'], tags: ['trending', 'english'] },
  { type: 'movie', title: 'Apex', overview: 'A high-speed adrenaline-fueled sports drama.', genres: ['Action', 'Drama'], tags: ['trending', 'english', 'fast-paced'] },
  { type: 'movie', title: 'Michael', overview: 'A biographical drama chronicling a legendary pop icon.', genres: ['Drama', 'Music'], tags: ['trending', 'english', 'biopic'] },
  { type: 'movie', title: "Lee Cronin's The Mummy", overview: 'A terrifying modern reimagining of the classic monster.', genres: ['Horror', 'Thriller'], tags: ['trending', 'english', 'scary'] },
  { type: 'movie', title: '28 Years Later: The Bone Temple', overview: 'The infected return in this post-apocalyptic sequel.', genres: ['Horror', 'Sci-Fi'], tags: ['trending', 'english', 'zombie'] },

  // TV Shows / Web Series
  { type: 'tv', title: 'Euphoria', overview: 'A group of high school students navigate love and friendships in a world of drugs, sex, trauma, and social media.', genres: ['Drama'], tags: ['trending', 'intense', 'dark'] },
  { type: 'tv', title: 'Spider-Noir', overview: 'An aging private investigator in 1930s New York City is forced to grapple with his past life as the city\'s one and only superhero.', genres: ['Action', 'Crime'], tags: ['trending', 'superhero', 'dark'] },
  { type: 'tv', title: 'The Bear', overview: 'A fine-dining chef returns home to run his family sandwich shop.', genres: ['Drama', 'Comedy'], tags: ['trending', 'fast-paced'] },
  { type: 'tv', title: 'Kohrra', overview: 'When a bridegroom is found dead days before his wedding, two police officers must unravel the troubling case as turbulence unfolds.', genres: ['Crime', 'Thriller'], tags: ['trending', 'dark', 'mystery'] },
  { type: 'tv', title: 'Panchayat', overview: 'An engineering graduate joins as a Panchayat secretary in a remote village.', genres: ['Comedy', 'Drama'], tags: ['trending', 'feel-good', 'warm'] },

  // Trending Albums / Songs
  { type: 'music', title: 'End of August', overview: 'A melancholic and reflective track capturing the transition of seasons.', genres: ['Pop', 'Indie'], tags: ['trending', 'chill'] },
  { type: 'music', title: 'Babydoll', overview: 'An upbeat synth-pop anthem.', genres: ['Pop', 'Synth Pop'], tags: ['trending', 'upbeat'] },
  { type: 'music', title: 'Risk It All', overview: 'A powerful ballad about taking chances on love.', genres: ['Pop', 'R&B'], tags: ['trending', 'emotional'] },
  { type: 'music', title: 'End of Beginning', overview: 'A soaring indie rock song about nostalgia and home.', genres: ['Indie Rock'], tags: ['trending', 'nostalgic'] },
  { type: 'music', title: 'Un Verano Sin Ti', overview: 'A vibrant and expansive reggaeton album defining the summer.', genres: ['Latin', 'Reggaeton'], tags: ['trending', 'upbeat', 'summer'], artists: ['Bad Bunny'] }
];

async function fetchTvMazePoster(title) {
  try {
    const res = await axios.get(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(title)}`);
    if (res.data && res.data.length > 0 && res.data[0].show.image) {
      return res.data[0].show.image.original || res.data[0].show.image.medium;
    }
  } catch (e) {}
  return null;
}

async function fetchITunesPoster(title, entity) {
  try {
    const res = await axios.get(`https://itunes.apple.com/search?term=${encodeURIComponent(title)}&entity=${entity}&limit=1`);
    if (res.data && res.data.results && res.data.results.length > 0) {
      const url = res.data.results[0].artworkUrl100;
      if (url) return url.replace('100x100bb', '600x600bb');
    }
  } catch (e) {}
  return null;
}

async function run() {
  const { seedContent } = await import('./src/data/seedContent.js');
  let addedCount = 0;

  for (const item of newItems) {
    // Avoid duplicates
    const exists = seedContent.some(c => c.title.toLowerCase() === item.title.toLowerCase() && c.type === item.type);
    if (exists) {
      console.log(`Skipping existing item: ${item.title} (${item.type})`);
      continue;
    }

    console.log(`Adding ${item.type}: ${item.title}`);
    item.releaseYear = 2024;
    item.rating = Math.round((Math.random() * 2 + 7) * 10) / 10;
    item.popularity = Math.floor(Math.random() * 20) + 80;

    let newUrl = null;
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (item.type === 'tv' || item.type === 'anime') {
      newUrl = await fetchTvMazePoster(item.title);
    } else if (item.type === 'movie') {
      newUrl = await fetchITunesPoster(item.title, 'movie');
    } else if (item.type === 'music') {
      newUrl = await fetchITunesPoster(item.title, 'album');
    }

    item.posterUrl = newUrl || `https://placehold.co/500x750/111522/ffffff?text=${encodeURIComponent(item.title)}`;
    
    seedContent.push(item);
    addedCount++;
  }

  if (addedCount > 0) {
    const fileContent = `export const seedContent = ${JSON.stringify(seedContent, null, 2)};\n`;
    await fs.writeFile(seedFilePath, fileContent, 'utf-8');
    console.log(`Successfully added ${addedCount} new items to seedContent.js`);
  } else {
    console.log('No new items to add.');
  }
}

run().catch(console.error);
