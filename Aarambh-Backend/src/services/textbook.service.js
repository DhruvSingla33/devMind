import { Textbook } from '../models/textbook.model.js';
import { Chapter } from '../models/chapter.model.js';
import { Page } from '../models/page.model.js';
import { Section } from '../models/section.model.js';
import { Question } from '../models/question.model.js';
import { ApiError } from '../utils/ApiError.js';

// A chapter is a labelled page-range on its book. This builds the Page query
// that selects the book's pages belonging to the chapter. If the range isn't
// set yet, an impossible filter is returned so the chapter simply shows no
// pages (admin must set startPage/endPage) instead of leaking the whole book.
const pageRangeFilter = (chapter) => {
  const { textbookId, startPage, endPage } = chapter;
  if (!startPage || !endPage) {
    return { textbookId, pageNumber: { $lt: 0 } };
  }
  return { textbookId, pageNumber: { $gte: startPage, $lte: endPage } };
};

export const getAllTextbooks = async (filter = {}) => {
  const query = { isActive: true };
  if (filter.subject) query.subject = filter.subject;
  if (filter.classLevel) query.classLevel = filter.classLevel;
  if (filter.exam) query.examTags = filter.exam;

  const textbooks = await Textbook.find(query).sort({ classLevel: 1, subject: 1 });
  return textbooks;
};

export const getTextbookByCode = async (code) => {
  const textbook = await Textbook.findOne({ code: code.toLowerCase(), isActive: true });
  if (!textbook) {
    throw new ApiError(404, 'Textbook not found');
  }

  const chapters = await Chapter.find({ textbookId: textbook._id, isActive: true }).sort({
    chapterNumber: 1,
  });

  return {
    ...textbook.toObject(),
    chapters,
  };
};

export const getChapterDetails = async (code, chapterNumber) => {
  const textbook = await Textbook.findOne({ code: code.toLowerCase(), isActive: true });
  if (!textbook) {
    throw new ApiError(404, 'Textbook not found');
  }

  const chapter = await Chapter.findOne({
    textbookId: textbook._id,
    chapterNumber: Number(chapterNumber),
    isActive: true,
  });

  if (!chapter) {
    throw new ApiError(404, 'Chapter not found');
  }

  // Pages belong to the BOOK now; a chapter is just a page-range. Load the
  // book's pages whose pageNumber falls inside this chapter's range, then all
  // their sections in one query and nest each section under its page.
  const pages = await Page.find({
    ...pageRangeFilter(chapter),
    isActive: true,
  }).sort({ order: 1, pageNumber: 1 });

  const pageIds = pages.map((p) => p._id);
  const sections = await Section.find({ pageId: { $in: pageIds }, isActive: true }).sort({
    order: 1,
  });

  const sectionsByPage = sections.reduce((acc, s) => {
    const key = s.pageId.toString();
    (acc[key] = acc[key] || []).push(s);
    return acc;
  }, {});

  // Load all page-linked quiz questions for this chapter in one query.
  // Answer-key fields are excluded (same policy as the question browse list)
  // so the correct option is never leaked in this public response.
  const questions = await Question.find({ pageId: { $in: pageIds }, isActive: true })
    .select('-correctOptionIndex -explanation -ncertRefPage')
    .sort({ createdAt: 1 });

  const quizByPage = questions.reduce((acc, q) => {
    const key = q.pageId.toString();
    (acc[key] = acc[key] || []).push(q);
    return acc;
  }, {});

  const pagesWithContent = pages.map((p) => {
    const key = p._id.toString();
    return {
      ...p.toObject(),
      sections: sectionsByPage[key] || [],
      quiz: quizByPage[key] || [],
    };
  });

  return {
    textbook,
    chapter,
    pages: pagesWithContent,
  };
};

// Admin Service Methods
export const createTextbook = async (data) => {
  const existing = await Textbook.findOne({ code: data.code.toLowerCase() });
  if (existing) {
    throw new ApiError(409, 'Textbook with this code already exists');
  }
  return await Textbook.create(data);
};

export const updateTextbook = async (id, data) => {
  const textbook = await Textbook.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!textbook) {
    throw new ApiError(404, 'Textbook not found');
  }
  return textbook;
};

export const deleteTextbook = async (id) => {
  const textbook = await Textbook.findByIdAndDelete(id);
  if (!textbook) {
    throw new ApiError(404, 'Textbook not found');
  }
  // Pages/sections/questions belong to the book directly now, so cascade them.
  const pages = await Page.find({ textbookId: id }).select('_id');
  const pageIds = pages.map((p) => p._id);
  await Promise.all([
    Chapter.deleteMany({ textbookId: id }),
    Page.deleteMany({ textbookId: id }),
    Question.deleteMany({ textbookId: id }),
    Section.deleteMany({ pageId: { $in: pageIds } }),
  ]);
  return { message: 'Textbook and all its chapters, pages, sections & quiz deleted' };
};

export const createChapter = async (textbookId, data) => {
  const textbook = await Textbook.findById(textbookId);
  if (!textbook) {
    throw new ApiError(404, 'Textbook not found');
  }
  return await Chapter.create({ ...data, textbookId });
};

export const updateChapter = async (chapterId, data) => {
  const chapter = await Chapter.findByIdAndUpdate(chapterId, data, { new: true, runValidators: true });
  if (!chapter) {
    throw new ApiError(404, 'Chapter not found');
  }
  return chapter;
};

export const deleteChapter = async (chapterId) => {
  const chapter = await Chapter.findByIdAndDelete(chapterId);
  if (!chapter) {
    throw new ApiError(404, 'Chapter not found');
  }
  return { message: 'Chapter deleted' };
};

// --- Pages (content pages inside a chapter) ---

// Admin view of a chapter's pages: full sections + quiz WITH the answer key
// (unlike getChapterDetails, which redacts it for the public reader).
export const getChapterPages = async (chapterId) => {
  const chapter = await Chapter.findById(chapterId);
  if (!chapter) {
    throw new ApiError(404, 'Chapter not found');
  }

  const pages = await Page.find(pageRangeFilter(chapter)).sort({ order: 1, pageNumber: 1 });
  const pageIds = pages.map((p) => p._id);

  const sections = await Section.find({ pageId: { $in: pageIds } }).sort({ order: 1 });
  const questions = await Question.find({ pageId: { $in: pageIds } }).sort({ createdAt: 1 });

  const sectionsByPage = sections.reduce((acc, s) => {
    const key = s.pageId.toString();
    (acc[key] = acc[key] || []).push(s);
    return acc;
  }, {});
  const quizByPage = questions.reduce((acc, q) => {
    const key = q.pageId.toString();
    (acc[key] = acc[key] || []).push(q);
    return acc;
  }, {});

  return pages.map((p) => {
    const key = p._id.toString();
    return {
      ...p.toObject(),
      sections: sectionsByPage[key] || [],
      quiz: quizByPage[key] || [],
    };
  });
};

// Create a page together with all its sections and quiz questions in one shot.
// Mongo standalone has no multi-doc transactions, so on any failure after the
// Page is created we best-effort roll back the child docs and the page itself
// to avoid leaving a half-built page behind.
export const createPage = async (textbookId, data = {}) => {
  const textbook = await Textbook.findById(textbookId);
  if (!textbook) {
    throw new ApiError(404, 'Textbook not found');
  }

  // Resolve page number: use the given one, else auto-increment past the
  // book's current highest page.
  let pageNumber = Number(data.pageNumber);
  if (!Number.isInteger(pageNumber) || pageNumber < 1) {
    const last = await Page.findOne({ textbookId }).sort({ pageNumber: -1 });
    pageNumber = last ? last.pageNumber + 1 : 1;
  }

  const clash = await Page.findOne({ textbookId, pageNumber });
  if (clash) {
    throw new ApiError(409, `Page number ${pageNumber} already exists in this book`);
  }

  let page;
  try {
    page = await Page.create({
      textbookId,
      pageNumber,
      title: (data.title || '').trim(),
      order: Number(data.order) || pageNumber,
    });

    const sectionsInput = Array.isArray(data.sections) ? data.sections : [];
    const sectionDocs = sectionsInput.map((s, index) => ({
      pageId: page._id,
      heading: (s.heading || '').trim(),
      order: Number.isInteger(s.order) ? s.order : index,
      contents: normalizeContents(s.contents),
    }));
    const sections = sectionDocs.length ? await Section.insertMany(sectionDocs) : [];

    const quizInput = Array.isArray(data.quiz) ? data.quiz : [];
    const quizDocs = quizInput.map((q) => ({
      textbookId,
      pageId: page._id,
      pageNumber,
      questionText: (q.questionText || '').trim(),
      options: (q.options || []).map((o) => ({
        text: typeof o === 'string' ? o.trim() : (o.text || '').trim(),
        image: o.image || '',
      })),
      correctOptionIndex: Number(q.correctOptionIndex),
      explanation: (q.explanation || '').trim(),
      difficulty: q.difficulty || 'medium',
      examTags: q.examTags && q.examTags.length ? q.examTags : ['NEET'],
      isHighProbability: q.isHighProbability ?? true,
    }));
    const quiz = quizDocs.length ? await Question.insertMany(quizDocs) : [];

    return { ...page.toObject(), sections, quiz };
  } catch (err) {
    // Roll back anything created for this page so a retry starts clean.
    if (page?._id) {
      await Promise.all([
        Section.deleteMany({ pageId: page._id }),
        Question.deleteMany({ pageId: page._id }),
        Page.deleteOne({ _id: page._id }),
      ]).catch(() => {});
    }
    if (err instanceof ApiError) throw err;
    throw new ApiError(400, err.message || 'Failed to create page');
  }
};

// Replace-style update: page fields are updated in place, then its sections and
// quiz are fully rebuilt from the payload (simpler and more predictable than
// diffing nested docs). The previous children are snapshotted first so a failed
// rebuild can be rolled back to the old content instead of losing it.
export const updatePageWithContent = async (pageId, data = {}) => {
  const page = await Page.findById(pageId);
  if (!page) {
    throw new ApiError(404, 'Page not found');
  }

  const { textbookId } = page;

  let pageNumber = page.pageNumber;
  const desired = Number(data.pageNumber);
  if (Number.isInteger(desired) && desired >= 1 && desired !== page.pageNumber) {
    const clash = await Page.findOne({ textbookId, pageNumber: desired, _id: { $ne: pageId } });
    if (clash) {
      throw new ApiError(409, `Page number ${desired} already exists in this book`);
    }
    pageNumber = desired;
  }

  page.title = (data.title || '').trim();
  page.pageNumber = pageNumber;
  if (data.order != null) page.order = Number(data.order) || pageNumber;
  await page.save();

  const sectionsInput = Array.isArray(data.sections) ? data.sections : [];
  const sectionDocs = sectionsInput.map((s, index) => ({
    pageId,
    heading: (s.heading || '').trim(),
    order: Number.isInteger(s.order) ? s.order : index,
    contents: normalizeContents(s.contents),
  }));

  const quizInput = Array.isArray(data.quiz) ? data.quiz : [];
  const quizDocs = quizInput.map((q) => ({
    textbookId,
    pageId,
    pageNumber,
    questionText: (q.questionText || '').trim(),
    options: (q.options || []).map((o) => ({
      text: typeof o === 'string' ? o.trim() : (o.text || '').trim(),
      image: o.image || '',
    })),
    correctOptionIndex: Number(q.correctOptionIndex),
    explanation: (q.explanation || '').trim(),
    difficulty: q.difficulty || 'medium',
    examTags: q.examTags && q.examTags.length ? q.examTags : ['NEET'],
    isHighProbability: q.isHighProbability ?? true,
  }));

  // Snapshot (with _id) so we can restore the old content if the rebuild fails.
  const oldSections = await Section.find({ pageId }).lean();
  const oldQuestions = await Question.find({ pageId }).lean();

  await Section.deleteMany({ pageId });
  await Question.deleteMany({ pageId });
  try {
    const sections = sectionDocs.length ? await Section.insertMany(sectionDocs) : [];
    const quiz = quizDocs.length ? await Question.insertMany(quizDocs) : [];
    return { ...page.toObject(), sections, quiz };
  } catch (err) {
    await Section.deleteMany({ pageId });
    await Question.deleteMany({ pageId });
    if (oldSections.length) await Section.insertMany(oldSections).catch(() => {});
    if (oldQuestions.length) await Question.insertMany(oldQuestions).catch(() => {});
    if (err instanceof ApiError) throw err;
    throw new ApiError(400, err.message || 'Failed to update page');
  }
};

export const deletePage = async (pageId) => {
  const page = await Page.findByIdAndDelete(pageId);
  if (!page) {
    throw new ApiError(404, 'Page not found');
  }
  await Promise.all([
    Section.deleteMany({ pageId }),
    Question.deleteMany({ pageId }),
  ]);
  return { message: 'Page and its sections & quiz deleted' };
};

// Keep only the fields relevant to each block type so a 'text' block can't
// smuggle in a stray image/table payload, and drop empty blocks.
function normalizeContents(contents) {
  if (!Array.isArray(contents)) return [];
  return contents
    .filter((c) => c && ['text', 'image', 'table'].includes(c.type))
    .map((c) => {
      if (c.type === 'text') {
        return { type: 'text', text: { body: c.text?.body || '' } };
      }
      if (c.type === 'image') {
        return {
          type: 'image',
          image: {
            url: c.image?.url || '',
            fileKey: c.image?.fileKey || '',
            caption: c.image?.caption || '',
            alt: c.image?.alt || '',
          },
        };
      }
      return {
        type: 'table',
        table: {
          caption: c.table?.caption || '',
          rows: Array.isArray(c.table?.rows) ? c.table.rows : [],
        },
      };
    });
}
