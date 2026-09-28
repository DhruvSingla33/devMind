import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

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

// CSV imports (e.g. bulk quiz upload) are parsed in-process from the buffer and
// never persisted to disk, so this uses memoryStorage.
//
// NOTE ON VALIDATION: a MIME/extension check here is only a light UX guard, not
// a security control — `file.mimetype` and the filename are both client-supplied
// (spoofable), and CSV has no magic bytes to sniff. The real guarantees live
// elsewhere: admin-only auth on the route, the size limit below (DoS guard), and
// parse-time validation in the service (csv-parse must succeed AND the required
// header columns must be present, else a 400 is returned). So we only reject the
// obviously-wrong pick by extension and let the parser be the source of truth.
function csvFileFilter(req, file, cb) {
  if (/\.csv$/i.test(file.originalname || '')) {
    cb(null, true);
  } else {
    // ApiError carries a 400 so error.middleware.js doesn't default it to 500.
    cb(new ApiError(400, 'Please upload a .csv file.'));
  }
}

export const csvUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: csvFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB — a very large quiz CSV
});
