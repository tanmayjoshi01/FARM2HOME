const jwt = require("jsonwebtoken");
const config = require("../config/env");

function signToken(payload, options = {}) {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: options.expiresIn || "1h",
  });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    return null;
  }
}

module.exports = {
  signToken,
  verifyToken,
};

