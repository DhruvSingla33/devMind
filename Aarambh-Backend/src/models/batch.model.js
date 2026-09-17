import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    targetExam: {
      type: String,
      enum: ['NEET', 'JEE_MAIN', 'JEE_ADVANCED', 'BOARD_12', 'BOARD_10'],
      required: true,
    },
    targetYear: {
      type: Number,
      required: true,
      default: 2026,
    },
    description: {
      type: String,
      required: true,
    },
    bannerImageUrl: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      default: 0, // 0 means FREE batch
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    features: [
      {
        type: String,
      },
    ],
    teachers: [
      {
        name: String,
        subject: String,
        experience: String,
        avatarUrl: String,
      },
    ],
    schedule: [
      {
        day: String,
        subject: String,
        topic: String,
        time: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    enrolledStudentsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Batch = mongoose.model('Batch', batchSchema);
