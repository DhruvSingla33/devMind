import mongoose from 'mongoose';

const mentorBookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mentor',
      required: true,
    },
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    paymentType: {
      type: String,
      enum: ['paid', 'free_streak_credit'],
      default: 'paid',
    },
    status: {
      type: String,
      enum: ['confirmed', 'completed', 'cancelled'],
      default: 'confirmed',
    },
    meetingLink: {
      type: String,
      default: 'https://meet.google.com/prep-page-mentor-session',
    },
  },
  {
    timestamps: true,
  }
);

export const MentorBooking = mongoose.model('MentorBooking', mentorBookingSchema);
