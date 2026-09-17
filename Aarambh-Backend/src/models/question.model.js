import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    textbookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Textbook',
      required: true,
    },
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: true,
    },
    // Optional link to a specific content Page. Nullable so existing
    // chapter-level questions (not tied to a page) stay valid.
    pageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Page',
      default: null,
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

questionSchema.index({ chapterId: 1, pageNumber: 1 });
questionSchema.index({ pageId: 1 });
questionSchema.index({ examTags: 1, pyqYear: 1 });

export const Question = mongoose.model('Question', questionSchema);
