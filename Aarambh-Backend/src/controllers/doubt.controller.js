import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/responseMapper.js';
import { HTTP_STATUS } from '../constants/app.constants.js';
import { Doubt } from '../models/doubt.model.js';
import { ApiError } from '../utils/ApiError.js';

export const createDoubt = asyncHandler(async (req, res) => {
  const doubt = await Doubt.create({
    ...req.body,
    studentId: req.user._id,
  });
  sendCreated(res, doubt, 'Doubt submitted successfully');
});

export const getMyDoubts = asyncHandler(async (req, res) => {
  const doubts = await Doubt.find({ studentId: req.user._id }).sort({ createdAt: -1 });
  sendSuccess(res, HTTP_STATUS.OK, doubts, 'Student doubts retrieved successfully');
});

export const getDoubtById = asyncHandler(async (req, res) => {
  const doubt = await Doubt.findById(req.params.id);
  if (!doubt) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Doubt not found');
  }
  sendSuccess(res, HTTP_STATUS.OK, doubt, 'Doubt details retrieved successfully');
});

// Admin / Mentor Controllers
export const getAllDoubts = asyncHandler(async (req, res) => {
  const { status, subject } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (subject) filter.subject = subject;

  const doubts = await Doubt.find(filter)
    .populate('studentId', 'name email phone avatarUrl')
    .sort({ createdAt: -1 });

  sendSuccess(res, HTTP_STATUS.OK, doubts, 'All doubts retrieved for Admin/Mentor review');
});

export const answerDoubt = asyncHandler(async (req, res) => {
  const { answerText, solutionImageUrl } = req.body;
  const doubt = await Doubt.findByIdAndUpdate(
    req.params.id,
    {
      status: 'RESOLVED',
      solution: {
        answeredBy: req.user._id,
        answerText,
        solutionImageUrl: solutionImageUrl || '',
        answeredAt: new Date(),
      },
    },
    { new: true }
  );

  if (!doubt) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Doubt not found');
  }

  sendSuccess(res, HTTP_STATUS.OK, doubt, 'Doubt resolved successfully');
});
