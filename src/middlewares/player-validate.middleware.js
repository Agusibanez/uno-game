const { ValidationError } = require("../utils/domain-errors");

function validateCreatePlayer(req, res, next) {
  const b = req.body;
  const errors = [];

  if (!b || typeof b !== "object") {
    errors.push({
      field: "body",
      message: "request body must be a JSON object",
    });
  }

  if (typeof b?.name !== "string" || b.name.trim().length < 2) {
    errors.push({ field: "name", message: "name must be min 2 chars" });
  }

  if (typeof b?.age !== "number" || b.age < 0) {
    errors.push({ field: "age", message: "age must be a number >= 0" });
  }

  const emailOk =
    typeof b?.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email);
  if (!emailOk)
    errors.push({ field: "email", message: "email format is invalid" });

  if (errors.length)
    return next(new ValidationError("Validation error", { errors }));
  next();
}

function validateUpdatePlayer(req, res, next) {
  const b = req.body;
  const errors = [];

  if (!b || typeof b !== "object") {
    errors.push({
      field: "body",
      message: "request body must be a JSON object",
    });
  }

  if (
    b?.name !== undefined &&
    (typeof b.name !== "string" || b.name.trim().length < 2)
  ) {
    errors.push({ field: "name", message: "name must be min 2 chars" });
  }

  if (b?.age !== undefined && (typeof b.age !== "number" || b.age < 0)) {
    errors.push({ field: "age", message: "age must be a number >= 0" });
  }

  if (b?.email !== undefined) {
    const emailOk =
      typeof b.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email);
    if (!emailOk)
      errors.push({ field: "email", message: "email format is invalid" });
  }

  if (errors.length)
    return next(new ValidationError("Validation error", { errors }));
  next();
}

function validateRegister(req, res, next) {
  const b = req.body;
  const errors = [];

  if (!b || typeof b !== "object") {
    errors.push({
      field: "body",
      message: "request body must be a JSON object",
    });
  }

  if (typeof b?.username !== "string" || b.username.trim().length < 2) {
    errors.push({ field: "username", message: "username must be min 2 chars" });
  }

  const emailOk =
    typeof b?.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email);
  if (!emailOk)
    errors.push({ field: "email", message: "email format is invalid" });

  if (typeof b?.password !== "string" || b.password.length < 6) {
    errors.push({ field: "password", message: "password must be min 6 chars" });
  }

  if (errors.length)
    return next(new ValidationError("Validation error", { errors }));
  next();
}

function validateLogin(req, res, next) {
  const b = req.body;
  const errors = [];

  if (!b || typeof b !== "object") {
    errors.push({
      field: "body",
      message: "request body must be a JSON object",
    });
  }

  if (typeof b?.username !== "string" || b.username.trim().length === 0) {
    errors.push({ field: "username", message: "username is required" });
  }

  if (typeof b?.password !== "string" || b.password.length === 0) {
    errors.push({ field: "password", message: "password is required" });
  }

  if (errors.length)
    return next(new ValidationError("Validation error", { errors }));

  next();
}


module.exports = {
  validateCreatePlayer,
  validateUpdatePlayer,
  validateRegister,
  validateLogin,
};
