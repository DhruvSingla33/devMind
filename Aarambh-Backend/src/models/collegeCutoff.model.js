import mongoose from 'mongoose';

const collegeCutoffSchema = new mongoose.Schema(
  {
    collegeName: {
      type: String,
      required: [true, 'College name is required'],
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['GEN', 'OBC', 'SC', 'ST', 'EWS'],
      default: 'GEN',
    },
    quota: {
      type: String,
      enum: ['AIQ', 'State'],
      default: 'AIQ',
    },
    closingRank: {
      type: Number,
      required: true,
    },
    closingMarks: {
      type: Number,
      required: true,
    },
    seats: {
      type: Number,
      default: 100,
    },
    course: {
      type: String,
      default: 'MBBS',
    },
    year: {
      type: Number,
      default: 2025,
    },
  },
  {
    timestamps: true,
  }
);

collegeCutoffSchema.index({ category: 1, closingRank: 1 });

export const CollegeCutoff = mongoose.model('CollegeCutoff', collegeCutoffSchema);
