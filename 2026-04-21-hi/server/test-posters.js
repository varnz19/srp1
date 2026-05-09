import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/entertainment_discovery')
  .then(async () => {
    const { default: Content } = await import('./src/models/Content.js');
    const all = await Content.find({});
    const missing = all.filter(c => !c.posterUrl);
    console.log(`Total items: ${all.length}`);
    console.log(`Items without posterUrl: ${missing.length}`);
    if (missing.length > 0) {
      console.log('Sample missing:', missing.slice(0, 5).map(c => c.title));
    }
    const nullOrEmptyStr = all.filter(c => c.posterUrl === '' || c.posterUrl === null);
    console.log(`Items with empty string poster: ${nullOrEmptyStr.length}`);
    process.exit(0);
  });
