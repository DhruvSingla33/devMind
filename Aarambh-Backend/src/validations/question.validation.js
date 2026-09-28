import Joi from 'joi';

export const createQuestionSchema = Joi.object({
  textbookId: Joi.string().required(),
  // Quiz questions belong to a page. Either pass pageId directly, or pass
  // pageNumber and the server resolves/creates the page under the textbook.
  pageId: Joi.string(),
  pageNumber: Joi.number().integer().min(1).default(1),
  questionText: Joi.string().trim().required(),
  options: Joi.array()
    .items(
      Joi.object({
        text: Joi.string().required(),
        image: Joi.string().allow(''),
      })
    )
    .min(2)
    .required(),
  correctOptionIndex: Joi.number().integer().min(0).max(3).required(),
  explanation: Joi.string().allow(''),
  ncertRefPage: Joi.string().allow(''),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').default('medium'),
  examTags: Joi.array().items(Joi.string().valid('NEET', 'JEE', 'BOARDS')),
  pyqYear: Joi.number().integer().allow(null),
  isHighProbability: Joi.boolean().default(true),
});
