import mongoose from 'mongoose';

const doubtSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subject: {
      type: String,
      enum: ['Physics', 'Chemistry', 'Biology', 'Botany', 'Zoology', 'Mathematics'],
      required: true,
    },
    chapter: {
      type: String,
      required: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED'],
      default: 'PENDING',
      index: true,
    },
    solution: {
      answeredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      answerText: String,
      solutionImageUrl: String,
      answeredAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Doubt = mongoose.model('Doubt', doubtSchema);
