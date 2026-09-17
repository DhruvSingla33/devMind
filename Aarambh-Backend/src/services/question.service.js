import { Question } from '../models/question.model.js';
import { ApiError } from '../utils/ApiError.js';

export const getQuestions = async (query = {}) => {
  const filter = { isActive: true };

  if (query.chapterId) filter.chapterId = query.chapterId;
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
    .populate('chapterId', 'chapterNumber title')
    .populate('textbookId', 'title code subject')
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
export const createQuestion = async (data) => {
  return await Question.create(data);
};

export const bulkCreateQuestions = async (questionsArray) => {
  if (!Array.isArray(questionsArray) || questionsArray.length === 0) {
    throw new ApiError(400, 'Questions array must be a non-empty array');
  }
  return await Question.insertMany(questionsArray);
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
