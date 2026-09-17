import mongoose from 'mongoose';

const mentorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Mentor name is required'],
      trim: true,
    },
    rankInfo: {
      type: String,
      required: [true, 'Rank info is required'], // e.g. "NEET 2024 AIR 142"
    },
    college: {
      type: String,
      required: [true, 'College is required'], // e.g. "AIIMS New Delhi"
    },
    bio: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 4.9,
    },
    hourlyRate: {
      type: Number,
      default: 499, // INR
    },
    subjects: {
      type: [String],
      default: ['NEET Strategy', 'Physics', 'Biology'],
    },
    slots: [
      {
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true },
        isBooked: { type: Boolean, default: false },
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

export const Mentor = mongoose.model('Mentor', mentorSchema);
