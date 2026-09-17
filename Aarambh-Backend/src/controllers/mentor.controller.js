import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as mentorService from '../services/mentor.service.js';

export const listMentors = asyncHandler(async (req, res) => {
  const mentors = await mentorService.listMentors();
  res.status(200).json(new ApiResponse(200, mentors, 'Mentors list retrieved successfully'));
});

export const getSlots = asyncHandler(async (req, res) => {
  const slots = await mentorService.getMentorSlots(req.params.id);
  res.status(200).json(new ApiResponse(200, slots, 'Mentor slots retrieved successfully'));
});

export const bookSession = asyncHandler(async (req, res) => {
  const booking = await mentorService.bookMentorSession(req.user._id, req.body);
  res.status(200).json(new ApiResponse(200, booking, 'Mentor session booked successfully'));
});

export const getStreak = asyncHandler(async (req, res) => {
  const streak = await mentorService.getUserStreak(req.user._id);
  res.status(200).json(new ApiResponse(200, streak, 'Practice streak retrieved successfully'));
});

export const logPracticeProgress = asyncHandler(async (req, res) => {
  const { count } = req.body;
  const streak = await mentorService.recordMcqPractice(req.user._id, count || 1);
  res.status(200).json(new ApiResponse(200, streak, 'Practice progress logged successfully'));
});

// Admin Controllers
export const adminCreateMentor = asyncHandler(async (req, res) => {
  const mentor = await mentorService.createAdminMentor(req.body);
  res.status(201).json(new ApiResponse(201, mentor, 'Mentor created successfully'));
});

export const adminAddSlots = asyncHandler(async (req, res) => {
  const mentor = await mentorService.addMentorSlots(req.params.id, req.body.slots);
  res.status(200).json(new ApiResponse(200, mentor, 'Mentor slots added successfully'));
});
