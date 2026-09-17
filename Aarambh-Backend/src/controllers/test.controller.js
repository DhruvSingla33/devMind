import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as testService from '../services/test.service.js';

export const listTests = asyncHandler(async (req, res) => {
  const tests = await testService.listMockTests(req.query);
  res.status(200).json(new ApiResponse(200, tests, 'Mock tests retrieved successfully'));
});

export const createMixQuiz = asyncHandler(async (req, res) => {
  const quiz = await testService.createCustomMixQuiz(req.body);
  res.status(201).json(new ApiResponse(201, quiz, 'Custom mix quiz generated successfully'));
});

export const startTest = asyncHandler(async (req, res) => {
  const session = await testService.startTestSession(req.user._id, req.params.id);
  res.status(200).json(new ApiResponse(200, session, 'Test session started successfully'));
});

export const submitTest = asyncHandler(async (req, res) => {
  const result = await testService.submitTestSession(req.params.attemptId, req.body.answers);
  res.status(200).json(new ApiResponse(200, result, 'Test submitted successfully'));
});

export const getMyAttempts = asyncHandler(async (req, res) => {
  const attempts = await testService.getUserAttempts(req.user._id);
  res.status(200).json(new ApiResponse(200, attempts, 'User test attempts retrieved successfully'));
});

// Admin Controllers
export const adminCreateTest = asyncHandler(async (req, res) => {
  const test = await testService.createAdminMockTest(req.body);
  res.status(201).json(new ApiResponse(201, test, 'Mock test created successfully'));
});

export const adminUpdateTest = asyncHandler(async (req, res) => {
  const test = await testService.updateAdminMockTest(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, test, 'Mock test updated successfully'));
});

export const adminDeleteTest = asyncHandler(async (req, res) => {
  const result = await testService.deleteAdminMockTest(req.params.id);
  res.status(200).json(new ApiResponse(200, result, 'Mock test deleted successfully'));
});
