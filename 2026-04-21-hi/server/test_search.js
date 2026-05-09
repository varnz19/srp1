import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { getMovieDetails, searchUnifiedCatalog } from './src/services/catalogService.js';
import Content from './src/models/Content.js';

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  try {
    console.log('Searching unified catalog...');
    const results = await searchUnifiedCatalog('queen of tears');
    console.log('Results:', results.length);
    if (!results.length) return;
    
    const id = results[0]._id;
    console.log('Fetching details for:', results[0].title, id);
    const details = await getMovieDetails(id);
    console.log('Details successful:', details.title);
  } catch (err) {
    console.error('Error:', err.message);
    console.error(err.stack);
  } finally {
    await mongoose.disconnect();
  }
}
test();
