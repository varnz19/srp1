// Environment loaded
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import tvRoutes from './routes/tvRoutes.js';
import { errorHandler, notFound } from './middleware/error.js';
import { startCatalogSyncJob } from './services/catalogSyncService.js';

const app = express();
const port = process.env.PORT || 5001;

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 60_000, limit: 180 }));

app.get('/api/health', (req, res) => res.json({ ok: true, name: 'Entertainment Discovery API' }));
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/tv', tvRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use(notFound);
app.use(errorHandler);

connectDB()
  .then(() =>
    app.listen(port, () => {
      console.log(`API running on http://localhost:${port}/api`);
      startCatalogSyncJob();
    })
  )
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
