import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pedp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function asPoster(item) {
  return item.posterUrl || `https://placehold.co/500x750/111522/ffffff?text=${encodeURIComponent(item.title || 'Watch')}`;
}
