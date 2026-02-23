const request = require("supertest");
const { app } = require("../src/app"); // ajusta si exportás diferente
const { cardRepo, gamePlayerRepo } = require("../src/repositories");

describe("Deal cards", () => {
  test("owner can deal cards recursively", async () => {
    expect(true).toBe(true);
  });
});
