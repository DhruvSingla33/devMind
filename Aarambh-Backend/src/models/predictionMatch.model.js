import mongoose from 'mongoose';

const predictionMatchSchema = new mongoose.Schema(
  {
    examName: {
      type: String,
      default: 'NEET 2026',
    },
    paperQuestionText: {
      type: String,
      required: [true, 'Actual exam paper question text is required'],
    },
    predictedQuestionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
    },
    predictedQuestionText: {
      type: String,
      required: true,
    },
    matchPercentage: {
      type: Number,
      default: 95,
    },
    proofImageUrl: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const PredictionMatch = mongoose.model('PredictionMatch', predictionMatchSchema);
