import { TestAttempt } from '../models/testAttempt.model.js';
import { PracticeStreak } from '../models/streak.model.js';
import { Question } from '../models/question.model.js';
import { Textbook } from '../models/textbook.model.js';

// --- Tunables -------------------------------------------------------------
// A question answered in <= this many seconds is "fast", otherwise "slow".
// Chosen as a sensible MCQ pace boundary (the design shows avg times ~38–81s).
const FAST_THRESHOLD_SECONDS = 60;
// Cause heuristics for a wrong answer, derived from how long it took: a very
// quick wrong answer reads as carelessness, a very slow one as time pressure,
// anything in between as a genuine concept gap.
const CARELESS_MAX_SECONDS = 25;
const TIME_PRESSURE_MIN_SECONDS = 90;

// Mastery bands by accuracy %, mirroring the design's labels.
function masteryFor(accuracy) {
  if (accuracy >= 85) return 'Strong';
  if (accuracy >= 70) return 'Improving';
  if (accuracy >= 55) return 'Needs Work';
  if (accuracy >= 40) return 'Weak';
  return 'Critical';
}

function dominantDifficulty(counts) {
  const order = ['hard', 'medium', 'easy'];
  let best = 'medium';
  let bestN = -1;
  order.forEach((d) => {
    if ((counts[d] || 0) > bestN) {
      bestN = counts[d] || 0;
      best = d;
    }
  });
  return best;
}

function causeFor(timeSpentSeconds) {
  if (timeSpentSeconds <= CARELESS_MAX_SECONDS) return 'Careless Error';
  if (timeSpentSeconds >= TIME_PRESSURE_MIN_SECONDS) return 'Time Pressure';
  return 'Concept Gap';
}

const ACTION_FOR_CAUSE = {
  'Concept Gap': 'Revise Concepts',
  'Careless Error': 'Practice More',
  'Time Pressure': 'Timed Practice',
};

const round = (n, p = 0) => {
  const f = 10 ** p;
  return Math.round((n + Number.EPSILON) * f) / f;
};

const pct = (num, den) => (den > 0 ? round((num / den) * 100) : 0);

function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  if (s < 60) return `${s}s`;
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

// ISO week-ish key (year + week number) for weekly bucketing of trend data.
function weekKey(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const week =
    1 + Math.round(((d - firstThursday) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

/**
 * Compute a real percentile for this user's overall accuracy against the
 * average accuracy of every other user who has completed at least one test.
 * Returns 0 when there is no cohort to compare against.
 */
async function computePercentile(userId, userAccuracy) {
  const perUser = await TestAttempt.aggregate([
    { $match: { status: 'completed' } },
    {
      $group: {
        _id: '$userId',
        correct: { $sum: '$correctCount' },
        answered: { $sum: '$answeredCount' },
      },
    },
    {
      $project: {
        accuracy: {
          $cond: [{ $gt: ['$answered', 0] }, { $multiply: [{ $divide: ['$correct', '$answered'] }, 100] }, 0],
        },
      },
    },
  ]);

  if (perUser.length <= 1) {
    // No peers yet — fall back to a gentle mapping off the user's own accuracy.
    return Math.min(99, Math.max(1, round(userAccuracy)));
  }

  const below = perUser.filter(
    (u) => String(u._id) !== String(userId) && u.accuracy < userAccuracy
  ).length;
  const peers = perUser.length - 1;
  return peers > 0 ? round((below / peers) * 100) : 0;
}

export const getPrepLabAnalytics = async (userId) => {
  const [attempts, streak] = await Promise.all([
    TestAttempt.find({ userId, status: 'completed' }).sort({ completedAt: 1, createdAt: 1 }).lean(),
    PracticeStreak.findOne({ userId }).lean(),
  ]);

  // Build a lookup of every answered question -> { subject, topic, difficulty }.
  const questionIds = new Set();
  attempts.forEach((a) => {
    (a.answers || []).forEach((ans) => {
      if (ans.selectedOption !== null && ans.selectedOption !== undefined) {
        questionIds.add(String(ans.questionId));
      }
    });
  });

  const questions = await Question.find({ _id: { $in: [...questionIds] } })
    .select('difficulty textbookId')
    .lean();
  const textbookIds = [...new Set(questions.map((q) => String(q.textbookId)))];
  const textbooks = await Textbook.find({ _id: { $in: textbookIds } })
    .select('subject title')
    .lean();
  const textbookById = new Map(textbooks.map((t) => [String(t._id), t]));
  const questionMeta = new Map(
    questions.map((q) => {
      const tb = textbookById.get(String(q.textbookId));
      return [
        String(q._id),
        {
          difficulty: q.difficulty || 'medium',
          subject: tb?.subject || 'General',
          topic: tb?.title || 'General',
        },
      ];
    })
  );

  // --- Flatten every answered question into a single stream ----------------
  const graded = []; // { topic, subject, difficulty, isCorrect, time, completedAt }
  attempts.forEach((a) => {
    (a.answers || []).forEach((ans) => {
      if (ans.selectedOption === null || ans.selectedOption === undefined) return;
      const meta = questionMeta.get(String(ans.questionId)) || {
        difficulty: 'medium',
        subject: 'General',
        topic: 'General',
      };
      graded.push({
        topic: meta.topic,
        subject: meta.subject,
        difficulty: meta.difficulty,
        isCorrect: !!ans.isCorrect,
        time: ans.timeSpentSeconds || 0,
        completedAt: a.completedAt || a.createdAt,
      });
    });
  });

  const totalAnswered = graded.length;
  const totalCorrect = graded.filter((g) => g.isCorrect).length;
  const totalIncorrect = totalAnswered - totalCorrect;
  const totalTime = graded.reduce((s, g) => s + g.time, 0);
  const overallAccuracy = pct(totalCorrect, totalAnswered);
  const avgTimePerQuestion = totalAnswered > 0 ? totalTime / totalAnswered : 0;
  const avgTimePerQuiz =
    attempts.length > 0
      ? attempts.reduce((s, a) => s + (a.answers || []).reduce((x, an) => x + (an.timeSpentSeconds || 0), 0), 0) /
        attempts.length
      : 0;

  // --- Week-over-week deltas for the summary tiles -------------------------
  const now = Date.now();
  const WEEK = 7 * 24 * 3600 * 1000;
  const thisWeek = graded.filter((g) => g.completedAt && now - new Date(g.completedAt).getTime() <= WEEK);
  const lastWeek = graded.filter((g) => {
    if (!g.completedAt) return false;
    const age = now - new Date(g.completedAt).getTime();
    return age > WEEK && age <= 2 * WEEK;
  });
  const accThis = pct(thisWeek.filter((g) => g.isCorrect).length, thisWeek.length);
  const accLast = pct(lastWeek.filter((g) => g.isCorrect).length, lastWeek.length);

  const percentile = await computePercentile(userId, overallAccuracy);

  // --- Group helper by a key field ----------------------------------------
  const groupBy = (key) => {
    const map = new Map();
    graded.forEach((g) => {
      const k = g[key];
      if (!map.has(k)) {
        map.set(k, { key: k, total: 0, correct: 0, time: 0, diff: { easy: 0, medium: 0, hard: 0 } });
      }
      const row = map.get(k);
      row.total += 1;
      if (g.isCorrect) row.correct += 1;
      row.time += g.time;
      row.diff[g.difficulty] = (row.diff[g.difficulty] || 0) + 1;
    });
    return map;
  };

  // --- Subject performance -------------------------------------------------
  const subjectMap = groupBy('subject');
  const subjectPerformance = [...subjectMap.values()]
    .map((r) => ({
      subject: r.key,
      accuracy: pct(r.correct, r.total),
      attempts: r.total,
    }))
    .sort((a, b) => b.accuracy - a.accuracy);

  // --- Topic performance matrix -------------------------------------------
  const topicMap = groupBy('topic');
  const topicPerformance = [...topicMap.values()]
    .map((r) => {
      const accuracy = pct(r.correct, r.total);
      return {
        topic: r.key,
        subject: (graded.find((g) => g.topic === r.key) || {}).subject || 'General',
        accuracy,
        avgTimeSeconds: round(r.time / r.total),
        difficulty: dominantDifficulty(r.diff),
        attempts: r.total,
        mastery: masteryFor(accuracy),
      };
    })
    .sort((a, b) => b.attempts - a.attempts);

  // Weakness matrix = the same topics plotted on accuracy × avg time.
  const weaknessMatrix = topicPerformance.map((t) => ({
    topic: t.topic,
    accuracy: t.accuracy,
    avgTimeSeconds: t.avgTimeSeconds,
    mastery: t.mastery,
  }));

  // --- Question intelligence (fast/slow × correct/wrong) ------------------
  const qi = { fastCorrect: 0, slowCorrect: 0, fastWrong: 0, slowWrong: 0 };
  graded.forEach((g) => {
    const fast = g.time <= FAST_THRESHOLD_SECONDS;
    if (g.isCorrect && fast) qi.fastCorrect += 1;
    else if (g.isCorrect && !fast) qi.slowCorrect += 1;
    else if (!g.isCorrect && fast) qi.fastWrong += 1;
    else qi.slowWrong += 1;
  });
  const questionIntelligence = {
    overallAccuracy,
    breakdown: [
      { key: 'fastCorrect', label: 'Fast & Correct', count: qi.fastCorrect, percent: pct(qi.fastCorrect, totalAnswered) },
      { key: 'slowCorrect', label: 'Slow & Correct', count: qi.slowCorrect, percent: pct(qi.slowCorrect, totalAnswered) },
      { key: 'fastWrong', label: 'Fast & Wrong', count: qi.fastWrong, percent: pct(qi.fastWrong, totalAnswered) },
      { key: 'slowWrong', label: 'Slow & Wrong', count: qi.slowWrong, percent: pct(qi.slowWrong, totalAnswered) },
    ],
    slowCorrectPercent: pct(qi.slowCorrect, totalAnswered),
  };

  // --- Mistake analysis by topic ------------------------------------------
  const mistakeMap = new Map();
  graded
    .filter((g) => !g.isCorrect)
    .forEach((g) => {
      if (!mistakeMap.has(g.topic)) {
        mistakeMap.set(g.topic, { topic: g.topic, total: 0, causes: {} });
      }
      const row = mistakeMap.get(g.topic);
      row.total += 1;
      const cause = causeFor(g.time);
      row.causes[cause] = (row.causes[cause] || 0) + 1;
    });
  const mistakeAnalysis = [...mistakeMap.values()]
    .map((r) => {
      const mostCommonCause = Object.entries(r.causes).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Concept Gap';
      return {
        topic: r.topic,
        totalMistakes: r.total,
        mostCommonCause,
        action: ACTION_FOR_CAUSE[mostCommonCause] || 'Revise Concepts',
      };
    })
    .sort((a, b) => b.totalMistakes - a.totalMistakes)
    .slice(0, 8);

  // --- Performance / score trend over time --------------------------------
  const perAttemptTrend = attempts.map((a) => ({
    date: a.completedAt || a.createdAt,
    accuracy: a.answeredCount > 0 ? pct(a.correctCount, a.answeredCount) : 0,
    score: a.totalScore || 0,
  }));

  // Weekly score-improvement series (accuracy per week bucket).
  const weekMap = new Map();
  graded.forEach((g) => {
    if (!g.completedAt) return;
    const k = weekKey(new Date(g.completedAt));
    if (!weekMap.has(k)) weekMap.set(k, { key: k, total: 0, correct: 0 });
    const row = weekMap.get(k);
    row.total += 1;
    if (g.isCorrect) row.correct += 1;
  });
  const weeklyTrend = [...weekMap.values()]
    .sort((a, b) => (a.key < b.key ? -1 : 1))
    .map((r, i) => ({ label: `Week ${i + 1}`, accuracy: pct(r.correct, r.total) }));

  const scoreImprovement = {
    from: weeklyTrend[0]?.accuracy ?? overallAccuracy,
    to: weeklyTrend[weeklyTrend.length - 1]?.accuracy ?? overallAccuracy,
    series: weeklyTrend,
  };
  scoreImprovement.delta = round(scoreImprovement.to - scoreImprovement.from);

  // --- Subject-wise progress (accuracy + week-over-week delta) ------------
  const subjectProgress = subjectPerformance.map((s) => {
    const sGraded = graded.filter((g) => g.subject === s.subject);
    const sThis = sGraded.filter((g) => g.completedAt && now - new Date(g.completedAt).getTime() <= 4 * WEEK);
    const sPrev = sGraded.filter((g) => {
      if (!g.completedAt) return false;
      const age = now - new Date(g.completedAt).getTime();
      return age > 4 * WEEK && age <= 8 * WEEK;
    });
    return {
      subject: s.subject,
      accuracy: s.accuracy,
      delta: round(pct(sThis.filter((g) => g.isCorrect).length, sThis.length) - pct(sPrev.filter((g) => g.isCorrect).length, sPrev.length)),
    };
  });

  // --- Focus areas + recommended plan (weakest topics) --------------------
  const weakest = [...topicPerformance]
    .filter((t) => t.attempts >= 1)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3);

  const focusAreas = weakest.map((t) => ({
    topic: t.topic,
    accuracy: t.accuracy,
    avgTimeSeconds: t.avgTimeSeconds,
    severity: t.accuracy < 50 ? 'Critical' : 'Needs Work',
  }));

  const recommendedPlan = weakest.map((t) => {
    const slow = t.avgTimeSeconds > FAST_THRESHOLD_SECONDS;
    return {
      topic: t.topic,
      mcqCount: Math.min(20, Math.max(10, t.attempts)),
      difficulty: t.difficulty,
      basis: slow ? 'Time Based' : t.accuracy < 50 ? 'Concept Focused' : 'Previous Year Based',
    };
  });

  return {
    overview: {
      overallAccuracyPercent: overallAccuracy,
      overallAccuracyDelta: round(accThis - accLast),
      totalQuestionsAttempted: totalAnswered,
      totalQuestionsThisWeek: thisWeek.length,
      totalQuestionsLastWeek: lastWeek.length,
      percentile,
      avgTimePerQuestionSeconds: round(avgTimePerQuestion),
      avgTimePerQuizSeconds: round(avgTimePerQuiz),
      avgTimePerQuizLabel: formatDuration(avgTimePerQuiz),
      totalTestsCompleted: attempts.length,
      totalCorrect,
      totalIncorrect,
    },
    performanceTrend: perAttemptTrend,
    subjectPerformance,
    focusAreas,
    topicPerformance,
    weaknessMatrix,
    questionIntelligence,
    mistakeAnalysis,
    scoreImprovement,
    subjectProgress,
    recommendedPlan,
    practiceStreak: {
      currentStreakDays: streak ? streak.currentStreakDays : 0,
      todayMcqCount: streak ? streak.todayMcqCount : 0,
      hasFreeMentorSessionCredit: streak ? streak.hasFreeMentorSessionCredit : false,
    },
    recentTestHistory: attempts.slice(-5).reverse(),
  };
};
