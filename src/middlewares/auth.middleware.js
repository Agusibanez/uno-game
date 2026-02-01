const jwt = require("jsonwebtoken");
const { Player } = require("../models");
const { HttpError } = require("../utils/errors");

async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      throw new HttpError(401, "Missing or invalid token");
    }

    const token = header.slice("Bearer ".length).trim();

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      throw new HttpError(401, "Invalid token");
    }

    const user = await Player.findByPk(payload.id);
    if (!user) throw new HttpError(401, "Invalid token");

    const dbTokenVersion = user.tokenVersion || 0;
    const tokenTokenVersion = payload.tokenVersion || 0;

    if (dbTokenVersion !== tokenTokenVersion) {
      throw new HttpError(401, "Invalid token");
    }

    req.user = { id: user.id, username: user.username };
    return next();
  } catch (e) {
    return next(e);
  }
}

module.exports = authMiddleware;
