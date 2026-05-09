import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const seedPath = path.join(__dirname, 'src', 'data', 'seedContent.js');
  const { seedContent } = await import('./src/data/seedContent.js');
  
  // Keep only the first 15 items
  const trimmed = seedContent.slice(0, 15);
  
  const fileContent = `export const seedContent = ${JSON.stringify(trimmed, null, 2)};\n`;
  await fs.writeFile(seedPath, fileContent, 'utf-8');
  console.log(`Successfully trimmed seedContent.js to ${trimmed.length} items.`);
}

run().catch(console.error);
