import mongoose from 'mongoose';

const aarambhPulseSchema = new mongoose.Schema(
  {
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      unique: true,
    },
    title: {
      type: String,
      default: 'Aarambh Daily 5-Minute Memory Workout',
    },
    puzzles: [
      {
        term: { type: String, required: true },
        definition: { type: String, required: true },
        category: { type: String, default: 'Formula' }, // Formula, Term, Sequence
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

export const AarambhPulse = mongoose.model('AarambhPulse', aarambhPulseSchema);
