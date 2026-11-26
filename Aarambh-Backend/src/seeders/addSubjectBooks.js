// Non-destructive: upserts the subject books by code without touching other data.
// Run with: npm run seed:books
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { Textbook } from '../models/textbook.model.js';
import { SUBJECT_BOOKS } from './subjectBooks.data.js';

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aarambh_db');
  for (const book of SUBJECT_BOOKS) {
    // Only fill fields on insert so existing books (and their PDFs) are left alone.
    const res = await Textbook.updateOne({ code: book.code }, { $setOnInsert: book }, { upsert: true });
    console.log(`${res.upsertedCount ? 'created' : 'exists '}  ${book.code}`);
  }
  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
