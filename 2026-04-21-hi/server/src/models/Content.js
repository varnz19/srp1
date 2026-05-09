import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema(
  {
    externalId: String,
    source: { type: String, enum: ['seed', 'tmdb', 'youtube', 'tvmaze', 'omdb'], default: 'seed' },
    type: { type: String, enum: ['movie', 'tv', 'anime'], required: true },
    title: { type: String, required: true, index: true },
    overview: String,
    posterUrl: String,
    backdropUrl: String,
    trailerUrl: String,
    releaseYear: Number,
    durationMinutes: Number,
    rating: { type: Number, default: 0 },
    popularity: { type: Number, default: 0 },
    genres: [String],
    tags: [String],
    people: [String],
    directors: [mongoose.Schema.Types.Mixed],
    cast: [mongoose.Schema.Types.Mixed],
        platforms: [String],
    language: String,
    vector: { type: Map, of: Number, default: {} },
    raw: Object
  },
  { timestamps: true }
);

contentSchema.index(
  { title: 'text', overview: 'text', genres: 'text', tags: 'text', people: 'text' },
  { default_language: 'none', language_override: '_language' }
);

export default mongoose.model('Content', contentSchema);
