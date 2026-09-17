import mongoose from 'mongoose';

// A single content block inside a section. The `type` decides which of the
// sibling fields is populated (text / image / table). Blocks are always read
// together with their section, so they live embedded rather than in their own
// collection.
const contentBlockSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['text', 'image', 'table'],
    },
    // type === 'text'
    text: {
      body: { type: String, default: '' },
    },
    // type === 'image' (reuses the S3 url/fileKey pattern used elsewhere)
    image: {
      url: { type: String, default: '' },
      fileKey: { type: String, default: '' },
      caption: { type: String, default: '' },
      alt: { type: String, default: '' },
    },
    // type === 'table' — rows is an array of rows, each row an array of cells
    table: {
      caption: { type: String, default: '' },
      rows: {
        type: [[String]],
        default: [],
      },
    },
  },
  { _id: false }
);

const sectionSchema = new mongoose.Schema(
  {
    pageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Page',
      required: true,
    },
    // Denormalized parent ref for fetching all sections of a chapter directly.
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: true,
    },
    heading: {
      type: String,
      default: '',
      trim: true,
    },
    // Ordering of sections within the page.
    order: {
      type: Number,
      default: 0,
    },
    contents: {
      type: [contentBlockSchema],
      default: [],
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

sectionSchema.index({ pageId: 1, order: 1 });

export const Section = mongoose.model('Section', sectionSchema);
