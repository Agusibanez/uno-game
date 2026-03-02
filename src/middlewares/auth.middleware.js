const jwt = require("jsonwebtoken");
const { Player } = require("../models");
const { UnauthorizedError } = require("../utils/domain-errors");
const { ok, err, ResultAsync } = require("../utils/result");

function parseBearer(header) {
  if (!header || !header.startsWith("Bearer ")) {
    return err(new UnauthorizedError("Missing or invalid token"));
  }
  const token = header.slice("Bearer ".length).trim();
  if (!token) return err(new UnauthorizedError("Missing or invalid token"));
  return ok(token);
}

function verifyJwtAsync(token) {
  return ResultAsync.fromPromise(
    () =>
      new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (e, payload) => {
          if (e) return reject(e);
          resolve(payload);
        });
      }),
    () => new UnauthorizedError("Invalid token"),
  );
}

function findUserAsync(id) {
  return ResultAsync.fromPromise(
    () => Player.findByPk(id),
    () => new UnauthorizedError("Invalid token"),
  ).chain((user) =>
    user
      ? ResultAsync.ok(user)
      : ResultAsync.err(new UnauthorizedError("Invalid token")),
  );
}

function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization;

    const tokenResult = parseBearer(header);
    if (tokenResult.isErr()) return next(tokenResult.error);

    return verifyJwtAsync(tokenResult.value)
      .chain((payload) => {
        const id = Number(payload?.id);
        if (!Number.isInteger(id)) {
          return ResultAsync.err(new UnauthorizedError("Invalid token"));
        }
        return findUserAsync(id).map((user) => ({ payload, user }));
      })
      .chain(({ payload, user }) => {
        const dbTokenVersion = user.tokenVersion || 0;
        const tokenTokenVersion = payload.tokenVersion || 0;

        if (dbTokenVersion !== tokenTokenVersion) {
          return ResultAsync.err(new UnauthorizedError("Invalid token"));
        }

        req.user = { id: user.id, username: user.username };
        return ResultAsync.ok(true);
      })
      .run()
      .then((r) => (r.isErr() ? next(r.error) : next()))
      .catch((e) => next(e));
  } catch (e) {
    return next(e);
  }
}

module.exports = authMiddleware;
