import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedFilePath = path.join(__dirname, 'src', 'data', 'seedContent.js');

const manualCovers = {
  "Strong Girl Do Bong Soon": "https://image.tmdb.org/t/p/w780/2qC8S2Z2v3m7Zq6l3A8P1M7c8d9.jpg",
  "Notting Hill": "https://image.tmdb.org/t/p/w780/3zqeH3fP3c6H2VbL9Yp9vU0KkM.jpg",
  "The Proposal": "https://image.tmdb.org/t/p/w780/z9Qf1B5U9N0eW6T8R1p6g7o0Z7.jpg",
  "10 Things I Hate About You": "https://image.tmdb.org/t/p/w780/1k1F4y7E9O5Q4L2S9S3P6P7B3A.jpg",
  "Crazy Rich Asians": "https://image.tmdb.org/t/p/w780/1XxL4a5GNdGNfRfo3n7Jc9oE13K.jpg",
  "Love Actually": "https://image.tmdb.org/t/p/w780/mQesXQ3n3pPqI2I0ZkS2rF9I1Q6.jpg",
  "A.I. Love K-Drama": "https://image.tmdb.org/t/p/w780/zB1B7q8B7C7B7D7E7F7G7H7I7J.jpg" // placeholder
};

async function run() {
  const { seedContent } = await import('./src/data/seedContent.js');
  let updatedCount = 0;

  for (const item of seedContent) {
    if (manualCovers[item.title]) {
      item.posterUrl = manualCovers[item.title];
      updatedCount++;
    }
  }

  if (updatedCount > 0) {
    const fileContent = `export const seedContent = ${JSON.stringify(seedContent, null, 2)};\n`;
    await fs.writeFile(seedFilePath, fileContent, 'utf-8');
    console.log(`Successfully updated ${updatedCount} manual covers.`);
  }
}

run().catch(console.error);
