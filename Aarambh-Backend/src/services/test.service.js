import { MockTest } from '../models/mockTest.model.js';
import { TestAttempt } from '../models/testAttempt.model.js';
import { Question } from '../models/question.model.js';
import { Chapter } from '../models/chapter.model.js';
import { ApiError } from '../utils/ApiError.js';

export const listMockTests = async (query = {}) => {
  const filter = { isActive: true };
  if (query.exam) filter.exam = query.exam;
  if (query.type) filter.type = query.type;

  return await MockTest.find(filter)
    .populate('questions', 'questionText difficulty examTags pyqYear')
    .sort({ createdAt: -1 });
};

export const createCustomMixQuiz = async ({ chapterIds, questionCount = 30, title, exam = 'NEET' }) => {
  const filter = { isActive: true };
  if (chapterIds && chapterIds.length > 0) {
    // Chapters are page-ranges now, so map each selected chapter to a
    // { book + pageNumber range } clause and match questions across all of them.
    const chapters = await Chapter.find({ _id: { $in: chapterIds } });
    const ranges = chapters
      .filter((c) => c.startPage && c.endPage)
      .map((c) => ({
        textbookId: c.textbookId,
        pageNumber: { $gte: c.startPage, $lte: c.endPage },
      }));
    if (ranges.length === 0) {
      throw new ApiError(400, 'Selected chapters have no page range configured');
    }
    filter.$or = ranges;
  }

  const availableQuestions = await Question.find(filter).limit(Number(questionCount));
  if (availableQuestions.length === 0) {
    throw new ApiError(400, 'No questions found for the selected chapters');
  }

  const mockTest = await MockTest.create({
    title: title || `Custom Mix Quiz (${availableQuestions.length} Qs)`,
    type: 'custom_mix',
    exam,
    durationMinutes: Math.ceil(availableQuestions.length * 1.5),
    totalMarks: availableQuestions.length * 4,
    questions: availableQuestions.map((q) => q._id),
  });

  return await MockTest.findById(mockTest._id).populate('questions');
};

export const startTestSession = async (userId, mockTestId) => {
  const mockTest = await MockTest.findById(mockTestId).populate('questions');
  if (!mockTest) {
    throw new ApiError(404, 'Mock test not found');
  }

  const initialAnswers = mockTest.questions.map((q) => ({
    questionId: q._id,
    selectedOption: null,
    status: 'not_visited',
    timeSpentSeconds: 0,
    isCorrect: false,
    marksObtained: 0,
  }));

  const attempt = await TestAttempt.create({
    userId,
    mockTestId,
    status: 'in_progress',
    answers: initialAnswers,
    totalQuestions: mockTest.questions.length,
  });

  return {
    attemptId: attempt._id,
    mockTest,
    startedAt: attempt.startedAt,
  };
};

export const submitTestSession = async (attemptId, submittedAnswers) => {
  const attempt = await TestAttempt.findById(attemptId);
  if (!attempt) {
    throw new ApiError(404, 'Test attempt session not found');
  }

  const mockTest = await MockTest.findById(attempt.mockTestId).populate('questions');
  const questionMap = new Map();
  mockTest.questions.forEach((q) => questionMap.set(q._id.toString(), q));

  let totalScore = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let answeredCount = 0;

  const processedAnswers = submittedAnswers.map((sub) => {
    const question = questionMap.get(sub.questionId.toString());
    const isAnswered = sub.selectedOption !== null && sub.selectedOption !== undefined;

    let isCorrect = false;
    let marksObtained = 0;

    if (isAnswered && question) {
      answeredCount++;
      if (Number(sub.selectedOption) === question.correctOptionIndex) {
        isCorrect = true;
        correctCount++;
        marksObtained = 4;
      } else {
        incorrectCount++;
        marksObtained = -1;
      }
    }

    totalScore += marksObtained;

    return {
      questionId: sub.questionId,
      selectedOption: sub.selectedOption,
      status: sub.status || (isAnswered ? 'answered' : 'not_answered'),
      timeSpentSeconds: sub.timeSpentSeconds || 0,
      isCorrect,
      marksObtained,
    };
  });

  const accuracy = answeredCount > 0 ? (correctCount / answeredCount) * 100 : 0;

  attempt.status = 'completed';
  attempt.answers = processedAnswers;
  attempt.answeredCount = answeredCount;
  attempt.correctCount = correctCount;
  attempt.incorrectCount = incorrectCount;
  attempt.totalScore = totalScore;
  attempt.accuracy = Math.round(accuracy * 100) / 100;
  attempt.completedAt = new Date();

  await attempt.save();

  return {
    attemptId: attempt._id,
    totalScore,
    totalQuestions: attempt.totalQuestions,
    answeredCount,
    correctCount,
    incorrectCount,
    accuracy: attempt.accuracy,
    answers: processedAnswers,
    mockTest,
  };
};

export const getUserAttempts = async (userId) => {
  return await TestAttempt.find({ userId })
    .populate('mockTestId', 'title type exam totalMarks')
    .sort({ createdAt: -1 });
};

// Admin Methods
export const createAdminMockTest = async (data) => {
  return await MockTest.create(data);
};

export const updateAdminMockTest = async (id, data) => {
  const test = await MockTest.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!test) {
    throw new ApiError(404, 'Mock test not found');
  }
  return test;
};

export const deleteAdminMockTest = async (id) => {
  const test = await MockTest.findByIdAndDelete(id);
  if (!test) {
    throw new ApiError(404, 'Mock test not found');
  }
  return { message: 'Mock test deleted' };
};
