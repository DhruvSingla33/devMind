import mongoose from 'mongoose';

const arenaChallengeSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    opponentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    title: {
      type: String,
      default: 'Aarambh 1v1 Challenge Arena',
    },
    subject: {
      type: String,
      enum: ['Biology', 'Physics', 'Chemistry', 'Maths'],
      default: 'Biology',
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
    creatorScore: {
      score: { type: Number, default: 0 },
      timeSeconds: { type: Number, default: 0 },
      submittedAt: { type: Date },
    },
    opponentScore: {
      score: { type: Number, default: 0 },
      timeSeconds: { type: Number, default: 0 },
      submittedAt: { type: Date },
    },
    status: {
      type: String,
      enum: ['open', 'active', 'completed'],
      default: 'open',
    },
    winnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export const ArenaChallenge = mongoose.model('ArenaChallenge', arenaChallengeSchema);
