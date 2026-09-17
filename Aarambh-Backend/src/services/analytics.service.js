import { TestAttempt } from '../models/testAttempt.model.js';
import { PracticeStreak } from '../models/streak.model.js';

export const getPrepLabAnalytics = async (userId) => {
  const attempts = await TestAttempt.find({ userId, status: 'completed' });
  const streak = await PracticeStreak.findOne({ userId });

  let totalQuestionsAttempted = 0;
  let totalCorrect = 0;
  let totalIncorrect = 0;
  let totalScoreSum = 0;

  attempts.forEach((a) => {
    totalQuestionsAttempted += a.answeredCount;
    totalCorrect += a.correctCount;
    totalIncorrect += a.incorrectCount;
    totalScoreSum += a.totalScore;
  });

  const overallAccuracy =
    totalQuestionsAttempted > 0
      ? Math.round((totalCorrect / totalQuestionsAttempted) * 100 * 100) / 100
      : 0;

  const averageScore =
    attempts.length > 0 ? Math.round((totalScoreSum / attempts.length) * 100) / 100 : 0;

  return {
    prepLabSummary: {
      totalTestsCompleted: attempts.length,
      totalQuestionsAttempted,
      totalCorrect,
      totalIncorrect,
      overallAccuracyPercent: overallAccuracy,
      averageScore,
    },
    practiceStreak: {
      currentStreakDays: streak ? streak.currentStreakDays : 0,
      todayMcqCount: streak ? streak.todayMcqCount : 0,
      hasFreeMentorSessionCredit: streak ? streak.hasFreeMentorSessionCredit : false,
    },
    recentTestHistory: attempts.slice(0, 5),
  };
};
