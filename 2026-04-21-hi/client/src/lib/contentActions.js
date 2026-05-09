import { api } from './api.js';

export async function saveContent(item, status = 'saved') {
  if (!item?._id) return null;
  const { data } = await api.post('/content/watchlist', { contentId: item._id, status });
  return data.entry;
}

export async function dismissContent(item) {
  if (!item?._id) return null;
  const { data } = await api.post('/content/watchlist', { contentId: item._id, status: 'dismissed' });
  return data.entry;
}
