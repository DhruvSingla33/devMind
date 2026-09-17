import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/responseMapper.js';
import { HTTP_STATUS } from '../constants/app.constants.js';
import * as textbookService from '../services/textbook.service.js';
import { getChapterPdfFileKey } from '../services/pdf.service.js';
import { invalidateCachePattern } from '../middlewares/cache.middleware.js';

export const listTextbooks = asyncHandler(async (req, res) => {
  const textbooks = await textbookService.getAllTextbooks(req.query);
  sendSuccess(res, HTTP_STATUS.OK, textbooks, 'Textbooks retrieved successfully');
});

export const getTextbook = asyncHandler(async (req, res) => {
  const result = await textbookService.getTextbookByCode(req.params.code);
  sendSuccess(res, HTTP_STATUS.OK, result, 'Textbook details retrieved successfully');
});

export const getChapter = asyncHandler(async (req, res) => {
  const result = await textbookService.getChapterDetails(req.params.code, req.params.chapterNumber);
  sendSuccess(res, HTTP_STATUS.OK, result, 'Chapter details retrieved successfully');
});

export const getChapterPdf = asyncHandler(async (req, res) => {
  const fileKey = await getChapterPdfFileKey(req.params.code, req.params.chapterNumber);
  const publicUrl = `${req.protocol}://${req.get('host')}/uploads/${fileKey}`;
  sendSuccess(res, HTTP_STATUS.OK, { fileKey, publicUrl }, 'Chapter PDF ready');
});

// Admin Controllers (Triggers Cache Invalidation)
export const adminCreateTextbook = asyncHandler(async (req, res) => {
  const textbook = await textbookService.createTextbook(req.body);
  await invalidateCachePattern('textbooks:*');
  sendCreated(res, textbook, 'Textbook created successfully');
});

export const adminUpdateTextbook = asyncHandler(async (req, res) => {
  const textbook = await textbookService.updateTextbook(req.params.id, req.body);
  await invalidateCachePattern('textbooks:*');
  sendSuccess(res, HTTP_STATUS.OK, textbook, 'Textbook updated successfully');
});

export const adminDeleteTextbook = asyncHandler(async (req, res) => {
  const result = await textbookService.deleteTextbook(req.params.id);
  await invalidateCachePattern('textbooks:*');
  sendSuccess(res, HTTP_STATUS.OK, result, 'Textbook deleted successfully');
});

export const adminCreateChapter = asyncHandler(async (req, res) => {
  const chapter = await textbookService.createChapter(req.params.textbookId, req.body);
  await invalidateCachePattern('textbooks:*');
  sendCreated(res, chapter, 'Chapter created successfully');
});

export const adminUpdateChapter = asyncHandler(async (req, res) => {
  const chapter = await textbookService.updateChapter(req.params.chapterId, req.body);
  await invalidateCachePattern('textbooks:*');
  sendSuccess(res, HTTP_STATUS.OK, chapter, 'Chapter updated successfully');
});

export const adminDeleteChapter = asyncHandler(async (req, res) => {
  const result = await textbookService.deleteChapter(req.params.chapterId);
  await invalidateCachePattern('textbooks:*');
  sendSuccess(res, HTTP_STATUS.OK, result, 'Chapter deleted successfully');
});

// Page Admin Controllers (Triggers Cache Invalidation)
export const adminListChapterPages = asyncHandler(async (req, res) => {
  const pages = await textbookService.getChapterPages(req.params.chapterId);
  sendSuccess(res, HTTP_STATUS.OK, pages, 'Pages retrieved successfully');
});

export const adminCreatePage = asyncHandler(async (req, res) => {
  const page = await textbookService.createPageWithContent(req.params.chapterId, req.body);
  await invalidateCachePattern('textbooks:*');
  sendCreated(res, page, 'Page created successfully');
});

export const adminUpdatePage = asyncHandler(async (req, res) => {
  const page = await textbookService.updatePageWithContent(req.params.pageId, req.body);
  await invalidateCachePattern('textbooks:*');
  sendSuccess(res, HTTP_STATUS.OK, page, 'Page updated successfully');
});

export const adminDeletePage = asyncHandler(async (req, res) => {
  const result = await textbookService.deletePage(req.params.pageId);
  await invalidateCachePattern('textbooks:*');
  sendSuccess(res, HTTP_STATUS.OK, result, 'Page deleted successfully');
});
