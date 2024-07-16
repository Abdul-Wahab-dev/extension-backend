module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((error) => {
      if (error.name === "TokenExpiredError") {
        error.statusCode = 401;
      }
      next(error);
    });
  };
};
