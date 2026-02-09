const jwt = require("jsonwebtoken");
const { Player } = require("../models");
const { UnauthorizedError } = require("../utils/domain-errors");

function verifyJwt(token, secret) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, payload) => {
      if (err) return reject(err);
      return resolve(payload);
    });
  });
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Missing or invalid token"));
  }

  const token = header.slice("Bearer ".length).trim();

  return verifyJwt(token, process.env.JWT_SECRET)
    .then((payload) => {
      if (!payload || !payload.id) {
        throw new UnauthorizedError("Invalid token");
      }

      return Player.findByPk(payload.id).then((user) => {
        if (!user) throw new UnauthorizedError("Invalid token");

        const dbTokenVersion = user.tokenVersion || 0;
        const tokenTokenVersion = payload.tokenVersion || 0;

        if (dbTokenVersion !== tokenTokenVersion) {
          throw new UnauthorizedError("Invalid token");
        }

        req.user = { id: user.id, username: user.username };
        next();
      });
    })
    .catch(() => next(new UnauthorizedError("Invalid token")));
}

module.exports = authMiddleware;
