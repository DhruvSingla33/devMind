import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES, AUTH_PROVIDERS } from '../constants/app.constants.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    phone: {
      type: String,
      sparse: true,
      trim: true,
    },
    classLevel: {
      type: String,
      enum: ['11th', '12th', 'dropper'],
    },
    // Editable academic profile details shown on the student profile page.
    targetExam: {
      type: String,
      trim: true,
      maxlength: [60, 'Target exam cannot exceed 60 characters'],
      default: '',
    },
    targetYear: {
      type: Number,
      min: [2000, 'Target year looks invalid'],
      max: [2100, 'Target year looks invalid'],
      default: null,
    },
    institute: {
      type: String,
      trim: true,
      maxlength: [120, 'Institute name cannot exceed 120 characters'],
      default: '',
    },
    password: {
      type: String,
      required: function () {
        return this.authProvider === AUTH_PROVIDERS.LOCAL;
      },
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.STUDENT,
    },
    avatar: {
      type: String,
      default: '',
    },
    authProvider: {
      type: String,
      enum: Object.values(AUTH_PROVIDERS),
      default: AUTH_PROVIDERS.LOCAL,
    },
    googleId: {
      type: String,
      sparse: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.isPasswordMatch = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);
