import mongoose from 'mongoose';

const textbookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Textbook title is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Textbook code is required'],
      unique: true,
      lowercase: true,
      trim: true, // e.g. 'biology-11', 'chemistry-12-part-1'
    },
    subject: {
      type: String,
      required: true,
      enum: ['Biology', 'Physics', 'Chemistry', 'Maths'],
    },
    classLevel: {
      type: String,
      required: true,
      enum: ['XI', 'XII'],
    },
    publisher: {
      type: String,
      default: 'NCERT',
    },
    icon: {
      type: String,
      default: '📚',
    },
    color: {
      type: String,
      default: '#3dd68c',
    },
    // Book cover image (S3 url/fileKey pattern used across the app).
    coverImage: {
      url: { type: String, default: '' },
      fileKey: { type: String, default: '' },
    },
    pdfUrl: {
      type: String,
      default: '', // Cost-effective S3 PDF URL reference
    },
    pdfFileKey: {
      type: String,
      default: '',
    },
    examTags: {
      type: [String],
      default: ['NEET', 'JEE'],
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

export const Textbook = mongoose.model('Textbook', textbookSchema);
