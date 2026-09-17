import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as service from '../services/prediction.service.js';

export const getMatchReport = asyncHandler(async (req, res) => {
  const result = await service.getMatchReport(req.query.examName || 'NEET 2026');
  res.status(200).json(new ApiResponse(200, result, 'Prediction match report fetched successfully'));
});

// Admin Controller
export const adminCreateMatch = asyncHandler(async (req, res) => {
  const match = await service.createAdminMatch(req.body);
  res.status(201).json(new ApiResponse(201, match, 'Prediction match report item created'));
});
