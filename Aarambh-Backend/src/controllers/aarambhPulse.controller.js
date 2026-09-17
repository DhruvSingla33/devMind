import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as service from '../services/aarambhPulse.service.js';

export const getTodayPulse = asyncHandler(async (req, res) => {
  const pulse = await service.getTodayAarambhPulse();
  res.status(200).json(new ApiResponse(200, pulse, 'Today Aarambh Pulse memory workout fetched successfully'));
});

// Admin Controllers
export const adminCreatePulse = asyncHandler(async (req, res) => {
  const pulse = await service.createAdminAarambhPulse(req.body);
  res.status(201).json(new ApiResponse(201, pulse, 'Aarambh Pulse workout created successfully'));
});
