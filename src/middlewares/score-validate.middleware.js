const { ValidationError } = require("../utils/domain-errors");

function validateCreateScore(req, res, next) {
  const b = req.body;
  const errors = [];

  if (!b || typeof b !== "object") {
    errors.push({
      field: "body",
      message: "request body must be a JSON object",
    });
  }

  if (b?.playerId == null || Number.isNaN(Number(b.playerId))) {
    errors.push({ field: "playerId", message: "playerId must be numeric" });
  }

  if (!b?.gameId || Number.isNaN(Number(b.gameId))) {
    errors.push({ field: "gameId", message: "gameId must be numeric" });
  }

  if (typeof b?.score !== "number") {
    errors.push({ field: "score", message: "score must be a number" });
  }

  if (errors.length)
    return next(new ValidationError("Validation error", { errors }));
  next();
}

function validateUpdateScore(req, res, next) {
  const b = req.body;
  const errors = [];

  if (!b || typeof b !== "object") {
    errors.push({
      field: "body",
      message: "request body must be a JSON object",
    });
  }

  if (b?.playerId !== undefined && Number.isNaN(Number(b.playerId))) {
    errors.push({ field: "playerId", message: "playerId must be numeric" });
  }

  if (b?.gameId !== undefined && Number.isNaN(Number(b.gameId))) {
    errors.push({ field: "gameId", message: "gameId must be numeric" });
  }

  if (b?.score !== undefined && typeof b.score !== "number") {
    errors.push({ field: "score", message: "score must be a number" });
  }

  if (errors.length)
    return next(new ValidationError("Validation error", { errors }));
  next();
}

module.exports = { validateCreateScore, validateUpdateScore };
