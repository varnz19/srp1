import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedFilePath = path.join(__dirname, 'src', 'data', 'seedContent.js');

async function fetchTvMazePoster(title) {
  try {
    const res = await axios.get(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(title)}`);
    if (res.data && res.data.length > 0 && res.data[0].show.image) {
      return res.data[0].show.image.original || res.data[0].show.image.medium;
    }
  } catch (e) {
    console.error(`Error fetching TVMaze for ${title}:`, e.message);
  }
  return null;
}

async function fetchITunesPoster(title, entity) {
  try {
    const res = await axios.get(`https://itunes.apple.com/search?term=${encodeURIComponent(title)}&entity=${entity}&limit=1`);
    if (res.data && res.data.results && res.data.results.length > 0) {
      const url = res.data.results[0].artworkUrl100;
      if (url) {
        return url.replace('100x100bb', '600x600bb');
      }
    }
  } catch (e) {
    console.error(`Error fetching iTunes for ${title}:`, e.message);
  }
  return null;
}

async function run() {
  console.log('Loading seedContent.js...');
  const { seedContent } = await import('./src/data/seedContent.js');
  
  let updatedCount = 0;

  for (const item of seedContent) {
    const isPlaceholder = !item.posterUrl || item.posterUrl.includes('unsplash.com') || item.posterUrl.includes('placehold.co');
    
    if (isPlaceholder) {
      console.log(`Fetching new cover for ${item.type}: ${item.title}`);
      let newUrl = null;
      
      // Add a small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (item.type === 'tv' || item.type === 'anime') {
        newUrl = await fetchTvMazePoster(item.title);
      } else if (item.type === 'movie') {
        newUrl = await fetchITunesPoster(item.title, 'movie');
      } else if (item.type === 'music') {
        newUrl = await fetchITunesPoster(item.title, 'album');
      }
      
      if (newUrl) {
        item.posterUrl = newUrl;
        updatedCount++;
        console.log(`  -> Found: ${newUrl}`);
      } else {
        console.log(`  -> No cover found for ${item.title}`);
      }
    }
  }

  if (updatedCount > 0) {
    console.log(`Updating ${updatedCount} items in seedContent.js...`);
    const fileContent = `export const seedContent = ${JSON.stringify(seedContent, null, 2)};\n`;
    await fs.writeFile(seedFilePath, fileContent, 'utf-8');
    console.log('Successfully updated seedContent.js');
  } else {
    console.log('No covers needed updating.');
  }
}

run().catch(console.error);
