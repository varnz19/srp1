import { fetchAndStoreTmdbCatalog } from './catalogService.js';
import { tmdbAvailable } from './tmdbService.js';

const dayMs = 1000 * 60 * 60 * 24;

export async function runCatalogSync() {
  if (!tmdbAvailable()) return { skipped: true, reason: 'tmdb-key-missing' };
  return fetchAndStoreTmdbCatalog();
}

export function startCatalogSyncJob() {
  runCatalogSync().catch((error) => {
    console.error('Initial catalog sync failed', error.message);
  });

  setInterval(() => {
    runCatalogSync().catch((error) => {
      console.error('Scheduled catalog sync failed', error.message);
    });
  }, dayMs);
}
