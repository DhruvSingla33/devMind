import mongoose from 'mongoose';
import { OTP_PURPOSE } from '../constants/app.constants.js';

const otpSchema = new mongoose.Schema(
  {
    phoneOrEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otpCode: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: Object.values(OTP_PURPOSE),
      default: OTP_PURPOSE.LOGIN,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: '10m' }, // Auto-delete document from MongoDB 10 mins after creation
    },
  },
  {
    timestamps: true,
  }
);

otpSchema.index({ phoneOrEmail: 1, purpose: 1 });

export const Otp = mongoose.model('Otp', otpSchema);
