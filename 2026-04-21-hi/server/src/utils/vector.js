export function normalizeToken(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

export function addFeature(vector, key, weight = 1) {
  const clean = normalizeToken(key);
  if (!clean) return vector;
  vector[clean] = (vector[clean] || 0) + weight;
  return vector;
}

export function buildPreferenceVector(preferences = {}) {
  const vector = {};
  (preferences.genres || []).forEach((g) => addFeature(vector, `genre_${g}`, 2.4));
  (preferences.people || []).forEach((p) => addFeature(vector, `person_${p}`, 1.8));
  (preferences.moods || []).forEach((m) => addFeature(vector, `mood_${m}`, 2));
  (preferences.platforms || []).forEach((p) => addFeature(vector, `platform_${p}`, 1));
  (preferences.contentTypes || []).forEach((t) => addFeature(vector, `type_${t}`, 1.4));
  return vector;
}

export function buildContentVector(content = {}) {
  const vector = {};
  addFeature(vector, `type_${content.type}`, 1.6);
  (content.genres || []).forEach((g) => addFeature(vector, `genre_${g}`, 2));
  (content.tags || []).forEach((t) => addFeature(vector, `tag_${t}`, 1.4));
  (content.people || []).forEach((p) => addFeature(vector, `person_${p}`, 1.2));
  (content.platforms || []).forEach((p) => addFeature(vector, `platform_${p}`, 0.6));
  if (content.rating) addFeature(vector, 'quality_high_rating', Math.min(content.rating / 10, 1));
  if (content.popularity) addFeature(vector, 'trend_popular', Math.min(content.popularity / 100, 1));
  if (content.releaseYear && content.releaseYear >= 2020) addFeature(vector, 'era_recent', 0.8);
  return vector;
}

export function cosineSimilarity(a = {}, b = {}) {
  const left = a instanceof Map ? Object.fromEntries(a) : a;
  const right = b instanceof Map ? Object.fromEntries(b) : b;
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;
  keys.forEach((key) => {
    const x = Number(left[key] || 0);
    const y = Number(right[key] || 0);
    dot += x * y;
    leftNorm += x * x;
    rightNorm += y * y;
  });
  if (!leftNorm || !rightNorm) return 0;
  return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
}
