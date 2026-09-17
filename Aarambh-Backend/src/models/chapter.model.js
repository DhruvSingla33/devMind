import mongoose from 'mongoose';

const chapterSchema = new mongoose.Schema(
  {
    textbookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Textbook',
      required: true,
    },
    chapterNumber: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Chapter title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    totalPages: {
      type: Number,
      default: 1,
    },
    // Page range within the PARENT TEXTBOOK's master PDF (1-indexed,
    // inclusive) — the normal path now: admin uploads one PDF for the whole
    // textbook, and each chapter just points at the pages that belong to it.
    // A per-chapter pdf-slice is generated on demand from these (see
    // pdf.service.js) and cached under uploads/chapter-pdfs/.
    startPage: {
      type: Number,
      default: null,
    },
    endPage: {
      type: Number,
      default: null,
    },
    // Legacy / manual-override path: if a chapter has its own pdfUrl set
    // directly (e.g. imported before per-chapter page ranges existed), that
    // takes priority over slicing the textbook's PDF.
    pdfUrl: {
      type: String,
      default: '',
    },
    pdfFileKey: {
      type: String,
      default: '',
    },
    examTags: {
      type: [String],
      default: ['NEET'],
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

chapterSchema.index({ textbookId: 1, chapterNumber: 1 }, { unique: true });

export const Chapter = mongoose.model('Chapter', chapterSchema);
