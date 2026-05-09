import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import Content from './models/Content.js';
import User from './models/User.js';
import Interaction from './models/Interaction.js';
import Watchlist from './models/Watchlist.js';
import { seedContent } from './data/seedContent.js';
import { buildContentVector, buildPreferenceVector } from './utils/vector.js';

async function seed() {
  await connectDB();
  await Promise.all([Content.deleteMany({}), User.deleteMany({}), Interaction.deleteMany({}), Watchlist.deleteMany({})]);

  const contents = await Content.insertMany(seedContent.map((item) => ({ ...item, vector: buildContentVector(item) })));

  const users = await User.create([
    {
      name: 'Demo Explorer',
      email: 'demo@example.com',
      password: 'password123',
      preferences: {
        genres: ['Sci-Fi', 'Drama', 'Animation'],
        people: ['Christopher Nolan', 'Michelle Yeoh'],
        moods: ['thrilling', 'emotional'],
        platforms: ['Netflix', 'Prime Video', 'Spotify'],
        contentTypes: ['movie', 'tv', 'anime'],
        vector: buildPreferenceVector({
          genres: ['Sci-Fi', 'Drama', 'Animation'],
          people: ['Christopher Nolan', 'Michelle Yeoh'],
          moods: ['thrilling', 'emotional'],
          platforms: ['Netflix', 'Prime Video', 'Spotify'],
          contentTypes: ['movie', 'tv', 'anime']
        })
      }
    },
    {
      name: 'Chill Listener',
      email: 'chill@example.com',
      password: 'password123',
      preferences: {
        genres: ['Comedy', 'Pop', 'Slice of Life'],
        people: ['Taylor Swift', 'Jason Sudeikis'],
        moods: ['happy', 'chill'],
        platforms: ['Apple TV', 'Spotify'],
        contentTypes: ['tv'],
        vector: buildPreferenceVector({
          genres: ['Comedy', 'Pop', 'Slice of Life'],
          people: ['Taylor Swift', 'Jason Sudeikis'],
          moods: ['happy', 'chill'],
          platforms: ['Apple TV', 'Spotify'],
          contentTypes: ['tv']
        })
      }
    }
  ]);

  const byTitle = Object.fromEntries(contents.map((c) => [c.title, c]));
  await Interaction.insertMany([
    { user: users[0]._id, content: byTitle.Interstellar._id, action: 'favorite', value: 1 },
    { user: users[0]._id, content: byTitle.Dark._id, action: 'save', value: 1 },
    { user: users[0]._id, content: byTitle['Everything Everywhere All at Once']._id, action: 'complete', value: 1 },
    { user: users[1]._id, content: byTitle['Ted Lasso']._id, action: 'favorite', value: 1 }
  ]);

  await Watchlist.insertMany([
    { user: users[0]._id, content: byTitle.Interstellar._id, status: 'favorite' },
    { user: users[0]._id, content: byTitle.Dark._id, status: 'saved' },
    { user: users[1]._id, content: byTitle['Ted Lasso']._id, status: 'favorite' }
  ]);

  console.log('Seeded content, demo users, interactions, and watchlists.');
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
