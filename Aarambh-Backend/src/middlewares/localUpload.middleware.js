import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';

// Saves uploaded files to disk under uploads/<folder>/, one sub-folder per
// upload "folder" name (mirrors the S3 flow's folder concept in
// s3.service.js — that code is untouched and still available, this is a
// parallel local-disk path used instead for now).
export const UPLOADS_ROOT = path.join(process.cwd(), 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = (req.params.folder || 'general').replace(/[^a-zA-Z0-9_-]/g, '');
    const dir = path.join(UPLOADS_ROOT, folder);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    cb(null, uniqueName);
  },
});

const ALLOWED_MIME_TYPES = /^(image\/|application\/pdf)/;

function fileFilter(req, file, cb) {
  if (ALLOWED_MIME_TYPES.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image or PDF files are allowed.'));
  }
}

export const localUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB — comfortably covers a full NCERT textbook PDF
});
