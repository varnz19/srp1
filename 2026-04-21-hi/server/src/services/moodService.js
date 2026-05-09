export const moodProfiles = {
  happy: {
    genres: ['Comedy', 'Animation', 'Adventure', 'Pop'],
    tags: ['feel-good', 'uplifting', 'colorful', 'warm'],
    avoid: ['bleak', 'tragic']
  },
  dark: {
    genres: ['Thriller', 'Crime', 'Horror', 'Dark Fantasy'],
    tags: ['noir', 'psychological', 'gritty', 'mysterious'],
    avoid: ['lighthearted']
  },
  thrilling: {
    genres: ['Action', 'Thriller', 'Sci-Fi', 'Mystery'],
    tags: ['fast-paced', 'suspense', 'chase', 'twist'],
    avoid: ['slow-burn']
  },
  emotional: {
    genres: ['Drama', 'Romance', 'Slice of Life', 'Indie'],
    tags: ['heartfelt', 'bittersweet', 'moving', 'character-driven'],
    avoid: ['detached']
  },
  chill: {
    genres: ['Lo-fi', 'Comedy', 'Documentary', 'Slice of Life'],
    tags: ['cozy', 'relaxed', 'low-stakes', 'ambient'],
    avoid: ['intense']
  }
};

export function moodBoost(content, mood) {
  const profile = moodProfiles[mood];
  if (!profile) return 0;
  const genres = new Set((content.genres || []).map((g) => g.toLowerCase()));
  const tags = new Set((content.tags || []).map((t) => t.toLowerCase()));
  const genreHits = profile.genres.filter((g) => genres.has(g.toLowerCase())).length;
  const tagHits = profile.tags.filter((t) => tags.has(t.toLowerCase())).length;
  const avoidHits = profile.avoid.filter((t) => tags.has(t.toLowerCase())).length;
  return genreHits * 0.08 + tagHits * 0.05 - avoidHits * 0.07;
}
