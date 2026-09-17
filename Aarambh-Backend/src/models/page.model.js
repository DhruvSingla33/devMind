import mongoose from 'mongoose';

const pageSchema = new mongoose.Schema(
  {
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: true,
    },
    // Denormalized parent ref so pages can be fetched by textbook without
    // first resolving the chapter (mirrors the chapter -> textbook link).
    textbookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Textbook',
      required: true,
    },
    pageNumber: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      default: '',
      trim: true,
    },
    // Explicit ordering within the chapter (falls back to pageNumber).
    order: {
      type: Number,
      default: 0,
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

pageSchema.index({ chapterId: 1, pageNumber: 1 }, { unique: true });

export const Page = mongoose.model('Page', pageSchema);
