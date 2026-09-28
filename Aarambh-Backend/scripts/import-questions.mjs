/**
 * Bulk-import MCQ questions from a CSV file into MongoDB.
 *
 * Usage:
 *   node scripts/import-questions.mjs <path-to-csv> [--dry-run]
 *   npm run import:questions -- <path-to-csv>            (insert)
 *   npm run import:questions -- <path-to-csv> --dry-run  (validate only)
 *
 * If no path is given it defaults to scripts/questions.sample.csv.
 *
 * CSV columns (header row required, order-independent):
 *   textbookCode        e.g. chemistry-11-part-1        (required)
 *   chapterNumber       (ignored — chapters are page-ranges now; kept for CSV compat)
 *   pageNumber          e.g. 1  -> links pageId if a matching Page exists (default 1)
 *   questionText                                        (required)
 *   option1..option4    the choices (>= 2 non-empty required)
 *   correctOption       1-4  OR  A-D  (which option is correct)  (required)
 *   explanation         shown after answering (optional)
 *   difficulty          easy | medium | hard  (default medium)
 *   examTags            pipe-separated: NEET|JEE|BOARDS  (default NEET)
 *   pyqYear             e.g. 2023, blank if not a PYQ (optional)
 *   ncertRefPage        e.g. "NCERT Chemistry XI - Page 2" (optional)
 *   isHighProbability   true | false  (default true)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { Textbook } from '../src/models/textbook.model.js';
import { Page } from '../src/models/page.model.js';
import { Question } from '../src/models/question.model.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---- args -----------------------------------------------------------------
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const csvPath = path.resolve(
  args.find((a) => !a.startsWith('--')) || path.join(__dirname, 'questions.sample.csv')
);

// ---- minimal RFC-4180 CSV parser (handles quotes, commas & newlines) ------
function parseCsv(text) {
  const rows = [];
  let field = '';
  let row = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field); field = '';
    } else if (c === '\r') {
      // ignore
    } else if (c === '\n') {
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  // drop fully-empty rows (e.g. trailing newline)
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

function toBool(v, def) {
  if (v === undefined || v.trim() === '') return def;
  return /^(true|1|yes|y)$/i.test(v.trim());
}

// correctOption -> 0-based index. Accepts 1-4 or A-D.
function parseCorrect(raw) {
  const v = (raw || '').trim();
  if (/^[A-Da-d]$/.test(v)) return v.toUpperCase().charCodeAt(0) - 65; // A->0
  const n = Number(v);
  if (Number.isInteger(n) && n >= 1 && n <= 4) return n - 1;
  return NaN;
}

const VALID_TAGS = ['NEET', 'JEE', 'BOARDS'];
const VALID_DIFF = ['easy', 'medium', 'hard'];

async function main() {
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV not found: ${csvPath}`);
    process.exit(1);
  }
  console.log(`📄 File: ${csvPath}`);
  console.log(dryRun ? '🧪 DRY RUN — validating only, nothing will be written.\n' : '');

  const rows = parseCsv(fs.readFileSync(csvPath, 'utf8'));
  if (rows.length < 2) {
    console.error('❌ CSV has no data rows (need a header + at least one row).');
    process.exit(1);
  }
  const header = rows[0].map((h) => h.trim());
  const dataRows = rows.slice(1);

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aarambh_db';
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log(`🔌 Connected: ${mongoose.connection.host}/${mongoose.connection.name}\n`);

  // small caches so repeated codes/chapters/pages don't re-query
  const bookCache = new Map();
  const pageCache = new Map();

  const valid = [];
  const errors = [];

  for (let i = 0; i < dataRows.length; i++) {
    const lineNo = i + 2; // 1-based incl. header
    const row = {};
    header.forEach((h, idx) => (row[h] = (dataRows[i][idx] ?? '').trim()));
    const fail = (msg) => errors.push(`Row ${lineNo}: ${msg}`);

    // --- required text
    if (!row.questionText) { fail('questionText is empty'); continue; }

    // --- resolve textbook
    const code = (row.textbookCode || '').toLowerCase();
    if (!code) { fail('textbookCode is empty'); continue; }
    if (!bookCache.has(code)) bookCache.set(code, await Textbook.findOne({ code }));
    const book = bookCache.get(code);
    if (!book) { fail(`textbookCode "${code}" not found`); continue; }

    // --- resolve page (required: quiz belongs to a page, book-scoped now).
    // The page is created on demand if it doesn't exist yet, unless --dry-run.
    const pageNumber = row.pageNumber ? Number(row.pageNumber) : 1;
    if (!Number.isInteger(pageNumber)) { fail(`pageNumber "${row.pageNumber}" invalid`); continue; }
    const pgKey = `${book._id}:${pageNumber}`;
    if (!pageCache.has(pgKey)) {
      let pg = await Page.findOne({ textbookId: book._id, pageNumber });
      if (!pg && !dryRun) {
        pg = await Page.create({ textbookId: book._id, pageNumber, order: pageNumber });
      }
      pageCache.set(pgKey, pg);
    }
    const page = pageCache.get(pgKey);
    if (!page && !dryRun) { fail(`could not resolve/create page ${pageNumber} in ${code}`); continue; }

    // --- options
    const options = [row.option1, row.option2, row.option3, row.option4]
      .map((t) => (t || '').trim())
      .filter((t) => t !== '')
      .map((t) => ({ text: t }));
    if (options.length < 2) { fail('need at least 2 non-empty options'); continue; }

    // --- correct option
    const correctOptionIndex = parseCorrect(row.correctOption);
    if (Number.isNaN(correctOptionIndex)) { fail(`correctOption "${row.correctOption}" must be 1-4 or A-D`); continue; }
    if (correctOptionIndex >= options.length) { fail(`correctOption points to an empty option`); continue; }

    // --- difficulty
    const difficulty = (row.difficulty || 'medium').toLowerCase();
    if (!VALID_DIFF.includes(difficulty)) { fail(`difficulty "${row.difficulty}" must be one of ${VALID_DIFF.join('/')}`); continue; }

    // --- exam tags
    let examTags = (row.examTags || '')
      .split('|')
      .map((t) => t.trim().toUpperCase())
      .filter(Boolean);
    if (examTags.length === 0) examTags = ['NEET'];
    const badTag = examTags.find((t) => !VALID_TAGS.includes(t));
    if (badTag) { fail(`examTag "${badTag}" must be one of ${VALID_TAGS.join('/')}`); continue; }

    // --- optional numerics / flags
    const pyqYear = row.pyqYear ? Number(row.pyqYear) : null;
    if (row.pyqYear && Number.isNaN(pyqYear)) { fail(`pyqYear "${row.pyqYear}" invalid`); continue; }

    valid.push({
      textbookId: book._id,
      pageId: page ? page._id : null,
      pageNumber,
      questionText: row.questionText,
      options,
      correctOptionIndex,
      explanation: row.explanation || '',
      ncertRefPage: row.ncertRefPage || '',
      difficulty,
      examTags,
      pyqYear,
      isHighProbability: toBool(row.isHighProbability, true),
    });
  }

  console.log(`✅ Valid rows:   ${valid.length}`);
  console.log(`❌ Invalid rows: ${errors.length}`);
  if (errors.length) console.log('\n' + errors.map((e) => '   • ' + e).join('\n'));

  if (dryRun) {
    console.log('\n🧪 Dry run complete — no data written.');
  } else if (valid.length) {
    const inserted = await Question.insertMany(valid, { ordered: false });
    console.log(`\n💾 Inserted ${inserted.length} question(s) into MongoDB.`);
  } else {
    console.log('\n⚠️  Nothing inserted (no valid rows).');
  }

  await mongoose.disconnect();
  process.exit(errors.length && !valid.length ? 1 : 0);
}

main().catch((err) => {
  console.error('💥 Import failed:', err.message);
  process.exit(1);
});
