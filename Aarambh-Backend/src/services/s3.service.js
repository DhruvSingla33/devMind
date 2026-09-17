import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS, MESSAGES } from '../constants/app.constants.js';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'mock_key',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'mock_secret',
  },
});

/**
 * Generate AWS S3 Presigned Upload URL for direct browser/mobile client uploads (Images & NCERT PDFs)
 * @param {Object} options
 * @param {string} options.fileType - MIME type e.g. 'image/jpeg', 'image/png', 'application/pdf'
 * @param {string} options.folder - Category subfolder e.g. 'questions', 'textbooks', 'pdfs', 'avatars'
 * @returns {Promise<{ uploadUrl: string, fileKey: string, publicUrl: string }>}
 */
export const generatePresignedUploadUrl = async ({ fileType, folder = 'general' }) => {
  const isImage = fileType && fileType.startsWith('image/');
  const isPdf = fileType === 'application/pdf';

  if (!isImage && !isPdf) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid file type. Only image files and PDF documents are permitted.');
  }

  const extension = isPdf ? 'pdf' : (fileType.split('/')[1] || 'jpg');
  const targetFolder = isPdf ? 'pdfs' : folder;
  const fileKey = `${targetFolder}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${extension}`;
  const bucketName = process.env.AWS_S3_BUCKET_NAME || 'aarambh-media-assets';

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
    ContentType: fileType,
  });

  try {
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    const publicUrl = `https://${bucketName}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${fileKey}`;

    return {
      uploadUrl,
      fileKey,
      publicUrl,
      expiresInSeconds: 900,
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      const mockKey = `${targetFolder}/dev-mock-${Date.now()}.${extension}`;
      return {
        uploadUrl: `https://mock-s3-upload-url.local/${mockKey}`,
        fileKey: mockKey,
        publicUrl: `https://aarambh-media-assets.s3.ap-south-1.amazonaws.com/${mockKey}`,
        expiresInSeconds: 900,
      };
    }
    throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, `Failed to generate AWS S3 presigned URL: ${error.message}`);
  }
};

/**
 * Get S3 Media / PDF Retrieval URL for viewing or downloading uploaded assets
 */
export const getImageRetrievalUrl = async (fileKey) => {
  if (!fileKey) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'File key is required');
  }

  const bucketName = process.env.AWS_S3_BUCKET_NAME || 'aarambh-media-assets';
  const publicUrl = `https://${bucketName}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${fileKey}`;

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
    });
    const presignedGetUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour GET URL

    return {
      fileKey,
      publicUrl,
      presignedGetUrl,
    };
  } catch (err) {
    return {
      fileKey,
      publicUrl,
      presignedGetUrl: publicUrl,
    };
  }
};
