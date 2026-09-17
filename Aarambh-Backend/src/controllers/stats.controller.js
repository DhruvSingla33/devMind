import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/user.model.js';
import { Question } from '../models/question.model.js';
import { Mentor } from '../models/mentor.model.js';
import { TestAttempt } from '../models/testAttempt.model.js';

// Public, honest platform stats for the marketing landing page — every
// number here is a real aggregate query, and the "recent activity" feed is
// fully anonymized (no userId/name is ever selected or returned).
export const getPublicStats = asyncHandler(async (req, res) => {
  const [totalStudents, totalQuestions, totalMentors, recentAttempts] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    Question.countDocuments({ isActive: true }),
    Mentor.countDocuments({ isActive: true }),
    TestAttempt.find({ status: 'completed' })
      .sort({ completedAt: -1 })
      .limit(8)
      .select('accuracy completedAt mockTestId')
      .populate('mockTestId', 'title exam'),
  ]);

  const recentActivity = recentAttempts.map((attempt) => ({
    exam: attempt.mockTestId?.exam || 'NEET',
    title: attempt.mockTestId?.title || 'Mock Test',
    accuracy: attempt.accuracy,
    completedAt: attempt.completedAt,
  }));

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { totalStudents, totalQuestions, totalMentors, recentActivity },
        'Public stats retrieved successfully'
      )
    );
});
