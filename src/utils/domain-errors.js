class DomainError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

class ValidationError extends DomainError {
  constructor(message = "Validation error", details = {}) {
    super("VALIDATION", message, details);
  }
}
class NotFoundError extends DomainError {
  constructor(message = "Not found", details = {}) {
    super("NOT_FOUND", message, details);
  }
}
class ConflictError extends DomainError {
  constructor(message = "Conflict", details = {}) {
    super("CONFLICT", message, details);
  }
}
class ForbiddenError extends DomainError {
  constructor(message = "Forbidden", details = {}) {
    super("FORBIDDEN", message, details);
  }
}
class UnauthorizedError extends DomainError {
  constructor(message = "Unauthorized", details = {}) {
    super("UNAUTHORIZED", message, details);
  }
}

module.exports = {
  DomainError,
  ValidationError,
  NotFoundError,
  ConflictError,
  ForbiddenError,
  UnauthorizedError,
};
