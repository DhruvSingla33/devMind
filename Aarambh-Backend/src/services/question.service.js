import { Question } from '../models/question.model.js';
import { Chapter } from '../models/chapter.model.js';
import { Page } from '../models/page.model.js';
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
