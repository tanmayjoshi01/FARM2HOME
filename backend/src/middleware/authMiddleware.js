const { verifyToken } = require("../utils/jwt");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.user = decoded;
  next();
}

function roleFarmer(req, res, next) {
  if (req.user.role !== "farmer") {
    return res.status(403).json({ error: "Only farmers can perform this action" });
  }
  next();
}

function roleAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Only admins can perform this action" });
  }
  next();
}

module.exports = {
  authMiddleware,
  roleFarmer,
  roleAdmin,
};
