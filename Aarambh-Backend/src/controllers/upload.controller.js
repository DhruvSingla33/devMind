import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/responseMapper.js';
import { HTTP_STATUS } from '../constants/app.constants.js';
import { generatePresignedUploadUrl, getImageRetrievalUrl } from '../services/s3.service.js';

// --- S3 flow (kept as-is, not currently used by the frontend — see below) ---

export const getPresignedUrl = asyncHandler(async (req, res) => {
  const { fileType, folder } = req.body;
  const result = await generatePresignedUploadUrl({ fileType, folder });
  sendSuccess(res, HTTP_STATUS.OK, result, 'AWS S3 presigned upload URL generated successfully');
});

export const getImage = asyncHandler(async (req, res) => {
  const fileKey = req.params[0] || req.query.fileKey;
  const result = await getImageRetrievalUrl(fileKey);
  sendSuccess(res, HTTP_STATUS.OK, result, 'Image retrieval URL generated successfully');
});

// --- Local disk flow (what the frontend actually uses right now) ---

export const uploadLocalFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'No file was uploaded.');
  }
  const folder = (req.params.folder || 'general').replace(/[^a-zA-Z0-9_-]/g, '');
  const fileKey = `${folder}/${req.file.filename}`;
  const publicUrl = `${req.protocol}://${req.get('host')}/uploads/${fileKey}`;

  sendSuccess(
    res,
    HTTP_STATUS.CREATED,
    { fileKey, publicUrl, folder },
    'File uploaded successfully'
  );
});
