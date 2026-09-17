import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as service from '../services/predictor.service.js';

export const predictRank = asyncHandler(async (req, res) => {
  const { marks, year } = req.body;
  const result = service.predictRankFromMarks(marks, year);
  res.status(200).json(new ApiResponse(200, result, 'NEET Rank estimated successfully'));
});

export const predictColleges = asyncHandler(async (req, res) => {
  const result = await service.predictCollegesFromMarks(req.body);
  res.status(200).json(new ApiResponse(200, result, 'Probable colleges predicted successfully'));
});

// Admin Controller
export const adminBulkImportCutoffs = asyncHandler(async (req, res) => {
  const result = await service.bulkImportCutoffs(req.body.cutoffs);
  res.status(201).json(new ApiResponse(201, result, `${result.length} college cutoffs imported successfully`));
});
