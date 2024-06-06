const jwt = require("jsonwebtoken");

exports.generateJwtToken = (payload, expiresIn) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn,
  });
};
