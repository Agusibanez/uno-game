const { ConflictError, ValidationError } = require("../../utils/domain-errors");

function assertGameStarted(game) {
  if (game.status !== "started") {
    throw new ConflictError("Game not started");
  }
}

function validateDealPayload(body) {
  const errors = [];

  if (
    typeof body?.cardsPerPlayer !== "number" ||
    body.cardsPerPlayer < 1 ||
    body.cardsPerPlayer > 20
  ) {
    errors.push({
      field: "cardsPerPlayer",
      message: "cardsPerPlayer must be a number between 1 and 20",
    });
  }

  if (errors.length) {
    throw new ValidationError("Validation error", { errors });
  }
}

module.exports = {
  assertGameStarted,
  validateDealPayload,
};
