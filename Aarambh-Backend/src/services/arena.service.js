import { ArenaChallenge } from '../models/arena.model.js';
import { Question } from '../models/question.model.js';
import { ApiError } from '../utils/ApiError.js';

export const createArenaChallenge = async (userId, { subject = 'Biology', questionCount = 5 }) => {
  const questions = await Question.find({ isActive: true }).limit(Number(questionCount));
  if (questions.length === 0) {
    throw new ApiError(400, 'No active questions available for Arena battle');
  }

  const challenge = await ArenaChallenge.create({
    creatorId: userId,
    subject,
    questions: questions.map((q) => q._id),
  });

  return await ArenaChallenge.findById(challenge._id)
    .populate('creatorId', 'name avatar')
    .populate('questions', 'questionText options difficulty');
};

export const joinArenaChallenge = async (userId, challengeId) => {
  const challenge = await ArenaChallenge.findById(challengeId);
  if (!challenge) {
    throw new ApiError(404, 'Arena challenge not found');
  }

  if (challenge.creatorId.toString() === userId.toString()) {
    throw new ApiError(400, 'You cannot join your own challenge as opponent');
  }

  if (challenge.status === 'completed') {
    throw new ApiError(400, 'This Arena challenge has already been completed');
  }

  challenge.opponentId = userId;
  challenge.status = 'active';
  await challenge.save();

  return await ArenaChallenge.findById(challenge._id)
    .populate('creatorId', 'name avatar')
    .populate('opponentId', 'name avatar')
    .populate('questions', 'questionText options difficulty');
};

export const submitArenaAnswers = async (userId, challengeId, { answers, timeSeconds = 0 }) => {
  const challenge = await ArenaChallenge.findById(challengeId).populate('questions');
  if (!challenge) {
    throw new ApiError(404, 'Arena challenge not found');
  }

  const questionMap = new Map();
  challenge.questions.forEach((q) => questionMap.set(q._id.toString(), q));

  let score = 0;
  answers.forEach((ans) => {
    const q = questionMap.get(ans.questionId.toString());
    if (q && Number(ans.selectedOption) === q.correctOptionIndex) {
      score += 4;
    }
  });

  const isCreator = challenge.creatorId.toString() === userId.toString();
  const scoreObj = { score, timeSeconds, submittedAt: new Date() };

  if (isCreator) {
    challenge.creatorScore = scoreObj;
  } else {
    challenge.opponentScore = scoreObj;
  }

  // If both players have submitted, calculate winner
  if (challenge.creatorScore.submittedAt && challenge.opponentScore.submittedAt) {
    challenge.status = 'completed';
    if (challenge.creatorScore.score > challenge.opponentScore.score) {
      challenge.winnerId = challenge.creatorId;
    } else if (challenge.opponentScore.score > challenge.creatorScore.score) {
      challenge.winnerId = challenge.opponentId;
    } else {
      // Tie breaker by time
      challenge.winnerId =
        challenge.creatorScore.timeSeconds <= challenge.opponentScore.timeSeconds
          ? challenge.creatorId
          : challenge.opponentId;
    }
  }

  await challenge.save();

  return await ArenaChallenge.findById(challenge._id)
    .populate('creatorId', 'name avatar')
    .populate('opponentId', 'name avatar')
    .populate('winnerId', 'name avatar');
};

export const getArenaChallenge = async (challengeId) => {
  const challenge = await ArenaChallenge.findById(challengeId)
    .populate('creatorId', 'name avatar')
    .populate('opponentId', 'name avatar')
    .populate('winnerId', 'name avatar')
    .populate('questions', 'questionText options correctOptionIndex explanation');

  if (!challenge) {
    throw new ApiError(404, 'Arena challenge not found');
  }
  return challenge;
};
