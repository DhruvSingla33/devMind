import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as service from '../services/arena.service.js';

export const createChallenge = asyncHandler(async (req, res) => {
  const challenge = await service.createArenaChallenge(req.user._id, req.body);
  res.status(201).json(new ApiResponse(201, challenge, 'Arena 1v1 challenge created successfully'));
});

export const joinChallenge = asyncHandler(async (req, res) => {
  const challenge = await service.joinArenaChallenge(req.user._id, req.params.id);
  res.status(200).json(new ApiResponse(200, challenge, 'Joined Arena 1v1 challenge successfully'));
});

export const submitAnswers = asyncHandler(async (req, res) => {
  const result = await service.submitArenaAnswers(req.user._id, req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, result, 'Arena battle answers submitted successfully'));
});

export const getChallengeDetails = asyncHandler(async (req, res) => {
  const challenge = await service.getArenaChallenge(req.params.id);
  res.status(200).json(new ApiResponse(200, challenge, 'Arena challenge details retrieved'));
});
