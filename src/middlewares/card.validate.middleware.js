const { ValidationError } = require("../utils/domain-errors");

function validateCreateCard(req, res, next) {
  const b = req.body;
  const errors = [];

  if (!b || typeof b !== "object") {
    errors.push({
      field: "body",
      message: "request body must be a JSON object",
    });
  }

  if (typeof b?.color !== "string" || b.color.trim().length < 3) {
    errors.push({
      field: "color",
      message: "color must be a string (min 3 chars)",
    });
  }

  if (typeof b?.value !== "string" || b.value.trim().length < 1) {
    errors.push({
      field: "value",
      message: "value must be a string",
    });
  }

  if (!b?.gameId || Number.isNaN(Number(b.gameId))) {
    errors.push({
      field: "gameId",
      message: "gameId must be numeric",
    });
  }

  if (errors.length) {
    return next(new ValidationError("Validation error", { errors }));
  }

  next();
}

module.exports = { validateCreateCard };
