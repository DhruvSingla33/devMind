/**
 * Async handler middleware to eliminate try-catch boilerplate in route controllers
 * @param {Function} fn - Async controller function (req, res, next)
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};
