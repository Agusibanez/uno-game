const {
  validateDealPayload,
  assertGameStarted,
} = require("../src/domain/uno/validators");

describe("uno validators", () => {
  test("validateDealPayload passes with valid input", () => {
    expect(() => validateDealPayload({ cardsPerPlayer: 7 })).not.toThrow();
  });

  test("validateDealPayload throws when cardsPerPlayer is invalid", () => {
    expect(() => validateDealPayload({ cardsPerPlayer: 0 })).toThrow(
      "Validation error",
    );
    expect(() => validateDealPayload({ cardsPerPlayer: "x" })).toThrow(
      "Validation error",
    );
  });

  test("assertGameStarted throws for non-started game", () => {
    expect(() => assertGameStarted({ status: "waiting" })).toThrow(
      "Game not started",
    );
  });
});
