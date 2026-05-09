const cache = new Map();

export function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

export function setCached(key, value, ttlMs = 1000 * 60 * 30) {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

export async function withCache(key, loader, ttlMs) {
  const cached = getCached(key);
  if (cached) return cached;
  const value = await loader();
  return setCached(key, value, ttlMs);
}
