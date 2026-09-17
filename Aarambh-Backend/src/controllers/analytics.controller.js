import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { getPrepLabAnalytics } from '../services/analytics.service.js';

export const getPrepLab = asyncHandler(async (req, res) => {
  const analytics = await getPrepLabAnalytics(req.user._id);
  res
    .status(200)
    .json(new ApiResponse(200, analytics, 'The Prep Lab analytics fetched successfully'));
});
