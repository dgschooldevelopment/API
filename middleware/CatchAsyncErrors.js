const CatchAsyncErrors = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
  module.exports = CatchAsyncErrors;
  