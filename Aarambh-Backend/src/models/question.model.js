import mongoose from 'mongoose';

// A quiz question now belongs to a PAGE (pageId required). The book link
// (textbookId) is kept denormalized for browsing/filtering. Chapters are just
// page-ranges on the book, so a question has no chapterId — "which chapter"
// is derived from the page's pageNumber falling inside a chapter's range.
const questionSchema = new mongoose.Schema(
  {
    textbookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Textbook',
      required: true,
    },
    pageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Page',
      required: true,
    },
    pageNumber: {
      type: Number,
      default: 1,
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    options: [
      {
        text: { type: String, required: true },
        image: { type: String, default: '' },
      },
    ],
    correctOptionIndex: {
      type: Number,
      required: [true, 'Correct option index (0-3) is required'],
      min: 0,
      max: 3,
    },
    explanation: {
      type: String,
      default: '',
    },
    ncertRefPage: {
      type: String,
      default: '', // e.g. "NCERT Biology XI - Page 142"
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    examTags: {
      type: [String],
      enum: ['NEET', 'JEE', 'BOARDS'],
      default: ['NEET'],
    },
    pyqYear: {
      type: Number,
      default: null, // e.g. 2024 if Previous Year Question
    },
    isHighProbability: {
      type: Boolean,
      default: true,
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

questionSchema.index({ textbookId: 1, pageNumber: 1 });
questionSchema.index({ pageId: 1 });
questionSchema.index({ examTags: 1, pyqYear: 1 });

export const Question = mongoose.model('Question', questionSchema);
