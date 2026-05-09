import mongoose from 'mongoose';

const interactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: mongoose.Schema.Types.ObjectId, ref: 'Content', required: true, index: true },
    action: {
      type: String,
      enum: ['view', 'click', 'save', 'dismiss', 'favorite', 'complete', 'search', 'time_spent'],
      required: true
    },
    value: { type: Number, default: 1 },
    metadata: Object
  },
  { timestamps: true }
);

interactionSchema.index({ user: 1, content: 1, action: 1 });

export default mongoose.model('Interaction', interactionSchema);
