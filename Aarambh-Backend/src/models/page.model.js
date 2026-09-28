import mongoose from 'mongoose';

// A content page now belongs DIRECTLY to a textbook (book). Chapters no longer
// own pages — a chapter is just a labelled page-range on the book (see
// chapter.model.js startPage/endPage), so a page has no chapterId at all.
const pageSchema = new mongoose.Schema(
  {
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
    // Explicit ordering within the book (falls back to pageNumber).
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

// Page numbers are unique per book now (not per chapter).
pageSchema.index({ textbookId: 1, pageNumber: 1 }, { unique: true });

export const Page = mongoose.model('Page', pageSchema);
