import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/responseMapper.js';
import { HTTP_STATUS } from '../constants/app.constants.js';
import { Bookmark } from '../models/bookmark.model.js';
import { ApiError } from '../utils/ApiError.js';

export const toggleBookmark = asyncHandler(async (req, res) => {
  const { questionId, notes } = req.body;
  const existing = await Bookmark.findOne({ userId: req.user._id, questionId });

  if (existing) {
    await Bookmark.findByIdAndDelete(existing._id);
    return sendSuccess(res, HTTP_STATUS.OK, { bookmarked: false }, 'Question removed from bookmarks');
  }

  const bookmark = await Bookmark.create({
    userId: req.user._id,
    questionId,
    notes: notes || '',
  });

  sendCreated(res, { bookmarked: true, bookmark }, 'Question bookmarked for revision');
});

export const getMyBookmarks = asyncHandler(async (req, res) => {
  const bookmarks = await Bookmark.find({ userId: req.user._id })
    .populate({
      path: 'questionId',
      populate: { path: 'textbookId', select: 'title subject classLevel' },
    })
    .sort({ createdAt: -1 });

  // Drop bookmarks whose question was deleted since.
  sendSuccess(res, HTTP_STATUS.OK, bookmarks.filter((b) => b.questionId), 'Bookmarked questions retrieved successfully');
});
