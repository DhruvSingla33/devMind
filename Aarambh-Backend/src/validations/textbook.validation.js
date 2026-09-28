import Joi from 'joi';

export const createTextbookSchema = Joi.object({
  title: Joi.string().trim().required(),
  code: Joi.string().trim().lowercase().required(),
  subject: Joi.string().valid('Biology', 'Physics', 'Chemistry', 'Maths').required(),
  classLevel: Joi.string().valid('XI', 'XII').required(),
  publisher: Joi.string().default('NCERT'),
  icon: Joi.string(),
  color: Joi.string(),
  examTags: Joi.array().items(Joi.string()),
});

export const createChapterSchema = Joi.object({
  chapterNumber: Joi.number().integer().min(1).required(),
  title: Joi.string().trim().required(),
  description: Joi.string().allow(''),
  totalPages: Joi.number().integer().min(1).default(1),
  // A chapter is a labelled page-range on the book's pages: pages whose
  // pageNumber falls in [startPage, endPage] belong to this chapter.
  startPage: Joi.number().integer().min(1).allow(null),
  endPage: Joi.number().integer().min(1).allow(null),
  examTags: Joi.array().items(Joi.string()),
});
