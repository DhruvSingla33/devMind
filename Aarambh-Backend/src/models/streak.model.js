import mongoose from 'mongoose';

const streakSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    currentStreakDays: {
      type: Number,
      default: 0,
    },
    lastPracticedDate: {
      type: String, // YYYY-MM-DD
      default: '',
    },
    todayMcqCount: {
      type: Number,
      default: 0,
    },
    hasFreeMentorSessionCredit: {
      type: Boolean,
      default: false,
    },
    freeSessionEarnedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const PracticeStreak = mongoose.model('PracticeStreak', streakSchema);
