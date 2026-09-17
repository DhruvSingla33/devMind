import mongoose from 'mongoose';

const mockTestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Mock Test title is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['full_length', 'custom_mix', 'subject_wise'],
      default: 'custom_mix',
    },
    exam: {
      type: String,
      enum: ['NEET', 'JEE'],
      default: 'NEET',
    },
    durationMinutes: {
      type: Number,
      default: 180, // e.g. 180 minutes for NEET full mock
    },
    totalMarks: {
      type: Number,
      default: 720, // 720 marks for NEET
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const MockTest = mongoose.model('MockTest', mockTestSchema);
