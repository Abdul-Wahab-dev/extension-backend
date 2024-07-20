module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((error) => {
      if (error.name === "TokenExpiredError") {
        error.statusCode = 401;
      }
      console.log({ error });
      next(error);
    });
  };
};
