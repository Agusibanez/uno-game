const { ValidationError } = require("../utils/domain-errors");

function validateGameCreate(req, res, next) {
  const data = req.body || {};
  const errors = [];

  if (typeof data.title !== "string" || data.title.trim().length < 2) {
    errors.push({
      field: "title",
      message: "title must be a string (min 2 chars)",
    });
  }
  if (typeof data.maxPlayers !== "number" || data.maxPlayers < 2) {
    errors.push({
      field: "maxPlayers",
      message: "maxPlayers must be a number >= 2",
    });
  }

  return errors.length
    ? next(new ValidationError("Validation error", { errors }))
    : next();
}

function validateGameUpdate(req, res, next) {
  const data = req.body || {};
  const errors = [];

  if (
    data.title !== undefined &&
    (typeof data.title !== "string" || data.title.trim().length < 2)
  ) {
    errors.push({
      field: "title",
      message: "title must be a string (min 2 chars)",
    });
  }
  if (
    data.status !== undefined &&
    (typeof data.status !== "string" || data.status.trim().length < 3)
  ) {
    errors.push({ field: "status", message: "status must be a string" });
  }
  if (
    data.maxPlayers !== undefined &&
    (typeof data.maxPlayers !== "number" || data.maxPlayers < 2)
  ) {
    errors.push({
      field: "maxPlayers",
      message: "maxPlayers must be a number >= 2",
    });
  }

  return errors.length
    ? next(new ValidationError("Validation error", { errors }))
    : next();
}

module.exports = { validateGameCreate, validateGameUpdate };
