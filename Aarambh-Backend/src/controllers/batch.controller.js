import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/responseMapper.js';
import { HTTP_STATUS } from '../constants/app.constants.js';
import { Batch } from '../models/batch.model.js';
import { ApiError } from '../utils/ApiError.js';

export const getBatches = asyncHandler(async (req, res) => {
  const { targetExam } = req.query;
  const filter = { isActive: true };
  if (targetExam) {
    filter.targetExam = targetExam;
  }
  const batches = await Batch.find(filter).sort({ createdAt: -1 });
  sendSuccess(res, HTTP_STATUS.OK, batches, 'Batches retrieved successfully');
});

export const getBatchById = asyncHandler(async (req, res) => {
  const batch = await Batch.findById(req.params.id);
  if (!batch) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Batch not found');
  }
  sendSuccess(res, HTTP_STATUS.OK, batch, 'Batch details retrieved successfully');
});

export const enrollInBatch = asyncHandler(async (req, res) => {
  const batch = await Batch.findByIdAndUpdate(
    req.params.id,
    { $inc: { enrolledStudentsCount: 1 } },
    { new: true }
  );
  if (!batch) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Batch not found');
  }
  sendSuccess(res, HTTP_STATUS.OK, { batchId: batch._id, enrolled: true }, 'Enrolled in batch successfully');
});

// Admin Controllers
export const createBatch = asyncHandler(async (req, res) => {
  const batch = await Batch.create(req.body);
  sendCreated(res, batch, 'Batch created successfully by Admin');
});

export const updateBatch = asyncHandler(async (req, res) => {
  const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!batch) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Batch not found');
  }
  sendSuccess(res, HTTP_STATUS.OK, batch, 'Batch updated successfully');
});

export const deleteBatch = asyncHandler(async (req, res) => {
  const batch = await Batch.findByIdAndDelete(req.params.id);
  if (!batch) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Batch not found');
  }
  sendSuccess(res, HTTP_STATUS.OK, null, 'Batch deleted successfully');
});
