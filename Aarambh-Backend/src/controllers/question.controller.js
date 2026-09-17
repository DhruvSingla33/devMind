import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as questionService from '../services/question.service.js';

export const listQuestions = asyncHandler(async (req, res) => {
  const result = await questionService.getQuestions(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Questions retrieved successfully'));
});

export const checkAnswer = asyncHandler(async (req, res) => {
  const { questionId, selectedOption } = req.body;
  const result = await questionService.submitAnswerCheck(questionId, selectedOption);
  res.status(200).json(new ApiResponse(200, result, 'Answer checked successfully'));
});

// Admin Controllers
export const adminCreateQuestion = asyncHandler(async (req, res) => {
  const question = await questionService.createQuestion(req.body);
  res.status(201).json(new ApiResponse(201, question, 'Question created successfully'));
});

export const adminBulkCreateQuestions = asyncHandler(async (req, res) => {
  const questions = await questionService.bulkCreateQuestions(req.body.questions);
  res.status(201).json(new ApiResponse(201, questions, `${questions.length} questions imported successfully`));
});

export const adminUpdateQuestion = asyncHandler(async (req, res) => {
  const question = await questionService.updateQuestion(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, question, 'Question updated successfully'));
});

export const adminDeleteQuestion = asyncHandler(async (req, res) => {
  const result = await questionService.deleteQuestion(req.params.id);
  res.status(200).json(new ApiResponse(200, result, 'Question deleted successfully'));
});
