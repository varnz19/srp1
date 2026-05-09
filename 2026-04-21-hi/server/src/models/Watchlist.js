import mongoose from 'mongoose';

const watchlistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: mongoose.Schema.Types.ObjectId, ref: 'Content', required: true },
    status: {
      type: String,
      enum: ['saved', 'watching', 'completed', 'favorite', 'dismissed'],
      default: 'saved'
    },
    notes: String
  },
  { timestamps: true }
);

watchlistSchema.index({ user: 1, content: 1 }, { unique: true });

export default mongoose.model('Watchlist', watchlistSchema);
