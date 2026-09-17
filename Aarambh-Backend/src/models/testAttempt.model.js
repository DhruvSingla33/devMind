import mongoose from 'mongoose';

const testAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mockTestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MockTest',
      required: true,
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed'],
      default: 'in_progress',
    },
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question',
          required: true,
        },
        selectedOption: {
          type: Number,
          default: null, // null if un-answered
        },
        status: {
          type: String,
          enum: ['answered', 'not_answered', 'marked_review', 'not_visited'],
          default: 'not_visited',
        },
        timeSpentSeconds: {
          type: Number,
          default: 0,
        },
        isCorrect: {
          type: Boolean,
          default: false,
        },
        marksObtained: {
          type: Number,
          default: 0, // +4 for correct, -1 for incorrect, 0 for unattempted
        },
      },
    ],
    totalQuestions: { type: Number, default: 0 },
    answeredCount: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    incorrectCount: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 }, // percentage
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const TestAttempt = mongoose.model('TestAttempt', testAttemptSchema);
