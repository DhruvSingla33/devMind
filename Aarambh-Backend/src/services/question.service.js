import { parse } from 'csv-parse/sync';
import { Question } from '../models/question.model.js';
import { Chapter } from '../models/chapter.model.js';
import { Page } from '../models/page.model.js';
import { Textbook } from '../models/textbook.model.js';
import { ApiError } from '../utils/ApiError.js';

export const getQuestions = async (query = {}) => {
  const filter = { isActive: true };

  // Questions are page-based now. Support the legacy `chapterId` query param by
  // translating the chapter into its book + page-range (chapter = page-range).
  if (query.chapterId) {
    const chapter = await Chapter.findById(query.chapterId);
    if (chapter && chapter.startPage && chapter.endPage) {
      filter.textbookId = chapter.textbookId;
      filter.pageNumber = { $gte: chapter.startPage, $lte: chapter.endPage };
    } else {
      // Unknown chapter or no range set -> no questions.
      filter.pageNumber = { $lt: 0 };
    }
  }
  if (query.textbookId) filter.textbookId = query.textbookId;
  if (query.pageId) filter.pageId = query.pageId;
  if (query.pageNumber) filter.pageNumber = Number(query.pageNumber);
  if (query.exam) filter.examTags = query.exam;
  if (query.isHighProbability !== undefined) {
    filter.isHighProbability = query.isHighProbability === 'true';
  }
  if (query.isPyq === 'true') {
    filter.pyqYear = { $ne: null };
  }

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const total = await Question.countDocuments(filter);
  const questions = await Question.find(filter)
    // Answer key fields are intentionally excluded here — they're only ever
    // revealed per-question via submitAnswerCheck(), so browsing the list
    // (now public, no login required) can never leak the correct option.
    .select('-correctOptionIndex -explanation -ncertRefPage')
    .populate('textbookId', 'title code subject')
    .populate('pageId', 'pageNumber title')
    .sort({ pageNumber: 1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    questions,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const submitAnswerCheck = async (questionId, selectedOption) => {
  const question = await Question.findById(questionId);
  if (!question) {
    throw new ApiError(404, 'Question not found');
  }

  const isCorrect = question.correctOptionIndex === Number(selectedOption);

  return {
    questionId,
    isCorrect,
    correctOptionIndex: question.correctOptionIndex,
    explanation: question.explanation,
    ncertRefPage: question.ncertRefPage,
  };
};

// Admin Methods

// Quiz questions belong to a page. If the caller didn't pass a pageId, resolve
// (or create) the page for { textbookId, pageNumber } so the question is always
// page-anchored without the admin needing to pre-create the page.
const resolvePageId = async (data) => {
  if (data.pageId) return data.pageId;
  if (!data.textbookId) throw new ApiError(400, 'textbookId is required');
  const pageNumber = Number(data.pageNumber) || 1;
  let page = await Page.findOne({ textbookId: data.textbookId, pageNumber });
  if (!page) {
    page = await Page.create({ textbookId: data.textbookId, pageNumber, order: pageNumber });
  }
  return page._id;
};

export const createQuestion = async (data) => {
  const pageId = await resolvePageId(data);
  return await Question.create({ ...data, pageId });
};

export const bulkCreateQuestions = async (questionsArray) => {
  if (!Array.isArray(questionsArray) || questionsArray.length === 0) {
    throw new ApiError(400, 'Questions array must be a non-empty array');
  }
  const withPages = [];
  for (const q of questionsArray) {
    const pageId = await resolvePageId(q);
    withPages.push({ ...q, pageId });
  }
  return await Question.insertMany(withPages);
};

// ---------------------------------------------------------------------------
// CSV bulk import (admin) — textbook-level quiz upload.
//
// Expected columns (header row required; matched case-insensitively and
// ignoring spaces/dots, so "Question No.", "NCERT Page", "PYQ Year" all work):
//   Question No.  (ignored — just an ordinal in the sheet)
//   Question      -> questionText            (required)
//   Options       -> options[]              (required; ";"-separated, "N)"/"A)"
//                                            prefixes are stripped; 2-4 choices)
//   Answer        -> correctOptionIndex     (required; 1-4, A-D, or exact text)
//   Solution      -> explanation            (optional)
//   NCERT Page    -> pageNumber (book page) (required; first integer in cell)
//   PYQ Year      -> pyqYear                (optional integer)
// ---------------------------------------------------------------------------

// Canonicalise a header cell: lower-case, drop dots, collapse spaces.
const normalizeHeader = (h) =>
  String(h || '').trim().toLowerCase().replace(/\./g, '').replace(/\s+/g, ' ');

// "1) Growth" / "A) Growth" / "1. Growth" -> "Growth". Only strips a leading
// numeric marker (N) or N.) or a single-letter+paren marker (A)) so option text
// like "e.g. foo" is never mangled.
const stripOptionMarker = (s) =>
  String(s || '').replace(/^\s*(?:\d+[).]|[A-Za-z][)])\s*/, '').trim();

const splitOptions = (raw) =>
  String(raw || '')
    .split(';')
    .map(stripOptionMarker)
    .filter((t) => t.length > 0);

// Answer cell -> 0-based option index. Accepts 1-4, A-D, or the exact option text.
const parseAnswerIndex = (raw, options) => {
  const v = String(raw || '').trim();
  if (v === '') return -1;
  if (/^[A-Za-z]$/.test(v)) {
    const idx = v.toUpperCase().charCodeAt(0) - 65; // A->0
    return idx < options.length ? idx : -1;
  }
  const n = Number(v);
  if (Number.isInteger(n) && n >= 1 && n <= options.length) return n - 1;
  // Fall back to matching the full answer text against an option.
  return options.findIndex((o) => o.text.trim().toLowerCase() === v.toLowerCase());
};

export const importQuestionsFromCsv = async ({ textbookId, csvText }) => {
  if (!textbookId) throw new ApiError(400, 'textbookId is required');
  const book = await Textbook.findById(textbookId);
  if (!book) throw new ApiError(404, 'Textbook not found');

  // --- parse (this + the column/row checks below are the real validation) ----
  let records;
  try {
    records = parse(csvText, {
      columns: (header) => header.map(normalizeHeader),
      skip_empty_lines: true,
      trim: true,
      bom: true, // Excel/Sheets exports often start with a UTF-8 BOM
      relax_column_count: true,
    });
  } catch (err) {
    throw new ApiError(400, `Could not parse CSV: ${err.message}`);
  }
  if (!records.length) throw new ApiError(400, 'CSV has no data rows.');

  const REQUIRED = ['question', 'options', 'answer', 'ncert page'];
  const present = Object.keys(records[0]);
  const missing = REQUIRED.filter((c) => !present.includes(c));
  if (missing.length) {
    throw new ApiError(
      400,
      `CSV is missing required column(s): ${missing.join(', ')}. ` +
        `Expected: Question, Options, Answer, NCERT Page (+ optional Solution, PYQ Year).`
    );
  }

  // --- map + validate each row ----------------------------------------------
  const errors = [];
  const valid = []; // { pageNumber, doc } — doc still needs pageId attached
  records.forEach((row, i) => {
    const line = i + 2; // 1-based, accounting for the header row
    const questionText = String(row['question'] || '').trim();
    const options = splitOptions(row['options']).map((text) => ({ text }));
    const pageNumber = parseInt(String(row['ncert page'] || '').match(/\d+/)?.[0], 10);
    const pyqRaw = String(row['pyq year'] || '').trim();
    const pyqYear = /^\d{4}$/.test(pyqRaw) ? Number(pyqRaw) : null;

    if (!questionText) return errors.push({ line, error: 'Question is empty.' });
    if (options.length < 2)
      return errors.push({ line, error: 'Options must contain at least 2 choices (";"-separated).' });
    if (options.length > 4)
      return errors.push({ line, error: `Too many options (${options.length}); max is 4.` });
    if (!Number.isInteger(pageNumber))
      return errors.push({ line, error: 'NCERT Page has no page number.' });

    const correctOptionIndex = parseAnswerIndex(row['answer'], options);
    if (correctOptionIndex < 0)
      return errors.push({ line, error: `Answer "${row['answer']}" does not match any option.` });

    valid.push({
      pageNumber,
      doc: {
        textbookId,
        pageNumber,
        questionText,
        options,
        correctOptionIndex,
        explanation: String(row['solution'] || '').trim(),
        ncertRefPage: String(row['ncert page'] || '').trim(),
        pyqYear,
        examTags: book.examTags?.includes('NEET') ? ['NEET'] : book.examTags || ['NEET'],
      },
    });
  });

  if (!valid.length) {
    return { imported: 0, totalRows: records.length, failed: errors.length, errors, pagesCreated: [], pagesOutsideChapter: [] };
  }

  // --- resolve/create the Page for each distinct page number -----------------
  const uniquePages = [...new Set(valid.map((v) => v.pageNumber))];
  const existing = await Page.find({ textbookId, pageNumber: { $in: uniquePages } });
  const pageIdByNumber = new Map(existing.map((p) => [p.pageNumber, p._id]));
  const pagesCreated = [];
  for (const pageNumber of uniquePages) {
    if (pageIdByNumber.has(pageNumber)) continue;
    const created = await Page.create({ textbookId, pageNumber, order: pageNumber });
    pageIdByNumber.set(pageNumber, created._id);
    pagesCreated.push(pageNumber);
  }

  // --- warn about pages that fall outside every chapter's page-range ---------
  // (Questions map to a chapter only via page ranges — see chapter.model.js —
  // so these import fine but won't surface under any chapter until a chapter
  // range covers them.)
  const chapters = await Chapter.find({ textbookId, startPage: { $ne: null }, endPage: { $ne: null } });
  const pagesOutsideChapter = uniquePages.filter(
    (pn) => !chapters.some((c) => pn >= c.startPage && pn <= c.endPage)
  );

  // --- insert ----------------------------------------------------------------
  const docs = valid.map((v) => ({ ...v.doc, pageId: pageIdByNumber.get(v.pageNumber) }));
  const inserted = await Question.insertMany(docs);

  return {
    imported: inserted.length,
    totalRows: records.length,
    failed: errors.length,
    errors,
    pagesCreated,
    pagesOutsideChapter,
  };
};

export const updateQuestion = async (id, data) => {
  const question = await Question.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!question) {
    throw new ApiError(404, 'Question not found');
  }
  return question;
};

export const deleteQuestion = async (id) => {
  const question = await Question.findByIdAndDelete(id);
  if (!question) {
    throw new ApiError(404, 'Question not found');
  }
  return { message: 'Question deleted successfully' };
};
