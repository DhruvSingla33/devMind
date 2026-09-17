import { PredictionMatch } from '../models/predictionMatch.model.js';

export const getMatchReport = async (examName = 'NEET 2026') => {
  const matches = await PredictionMatch.find({ examName, isActive: true })
    .populate('predictedQuestionId', 'questionText ncertRefPage options')
    .sort({ matchPercentage: -1 });

  return {
    examName,
    totalPredictedMatches: matches.length,
    matches,
  };
};

// Admin Methods
export const createAdminMatch = async (data) => {
  return await PredictionMatch.create(data);
};
