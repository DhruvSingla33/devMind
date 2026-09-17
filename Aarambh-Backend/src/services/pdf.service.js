import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import { ApiError } from '../utils/ApiError.js';
import { UPLOADS_ROOT } from '../middlewares/localUpload.middleware.js';
import { getChapterDetails } from './textbook.service.js';

const CHAPTER_PDF_CACHE_DIR = path.join(UPLOADS_ROOT, 'chapter-pdfs');

function fileKeyToPath(fileKey) {
  return path.join(UPLOADS_ROOT, fileKey);
}

// Returns a fileKey (under uploads/) pointing at a PDF containing exactly
// this chapter's pages. Normal path: slice chapter.startPage..endPage out of
// the parent textbook's single master PDF, generated once and cached on
// disk (uploads/chapter-pdfs/<chapterId>_<range>_<source>.pdf) so repeat
// requests are free.
// Legacy path: if the chapter has its own pdfFileKey set directly, use that
// instead of slicing.
export const getChapterPdfFileKey = async (code, chapterNumber) => {
  const { textbook, chapter } = await getChapterDetails(code, chapterNumber);

  if (chapter.pdfFileKey) {
    return chapter.pdfFileKey;
  }

  if (!textbook.pdfFileKey) {
    throw new ApiError(404, 'No PDF has been uploaded for this textbook yet.');
  }
  if (!chapter.startPage || !chapter.endPage) {
    throw new ApiError(404, "This chapter's page range hasn't been set yet — ask an admin to set it.");
  }

  // The page range and source file are part of the name, so changing the
  // range or re-uploading the textbook PDF produces a fresh slice instead of
  // serving a stale cached one.
  const sourceName = path.basename(textbook.pdfFileKey, path.extname(textbook.pdfFileKey));
  const cacheFileKey = `chapter-pdfs/${chapter._id}_${chapter.startPage}-${chapter.endPage}_${sourceName}.pdf`;
  const cachePath = fileKeyToPath(cacheFileKey);

  if (fs.existsSync(cachePath)) {
    return cacheFileKey;
  }

  const sourcePath = fileKeyToPath(textbook.pdfFileKey);
  if (!fs.existsSync(sourcePath)) {
    throw new ApiError(404, 'The textbook PDF file is missing on the server.');
  }

  const sourceBytes = fs.readFileSync(sourcePath);
  const sourceDoc = await PDFDocument.load(sourceBytes);
  const totalPages = sourceDoc.getPageCount();

  const startIndex = Math.max(0, chapter.startPage - 1);
  const endIndex = Math.min(totalPages - 1, chapter.endPage - 1);
  if (startIndex > endIndex) {
    throw new ApiError(400, "This chapter's page range doesn't match the uploaded PDF.");
  }

  const pageIndices = [];
  for (let i = startIndex; i <= endIndex; i += 1) pageIndices.push(i);

  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(sourceDoc, pageIndices);
  copiedPages.forEach((page) => newDoc.addPage(page));

  const newBytes = await newDoc.save();
  fs.mkdirSync(CHAPTER_PDF_CACHE_DIR, { recursive: true });
  fs.writeFileSync(cachePath, newBytes);

  return cacheFileKey;
};
