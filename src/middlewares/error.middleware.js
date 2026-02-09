const {
  DomainError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} = require("../utils/domain-errors");

function errorMiddleware(err, req, res, next) {
  if (err instanceof DomainError) {
    if (err instanceof ValidationError) {
      return res.status(400).json({
        message: err.message || "Validation error",
        errors: err.details?.errors || [],
      });
    }

    if (err instanceof UnauthorizedError) {
      return res.status(401).json({ message: err.message || "Unauthorized" });
    }

    if (err instanceof ForbiddenError) {
      return res.status(403).json({ message: err.message || "Forbidden" });
    }

    if (err instanceof NotFoundError) {
      return res.status(404).json({ message: err.message || "Not found" });
    }

    if (err instanceof ConflictError) {
      return res.status(409).json({ message: err.message || "Conflict" });
    }

    return res.status(400).json({ message: err.message || "Bad request" });
  }

  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
}

module.exports = errorMiddleware;
