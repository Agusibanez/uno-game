jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

jest.mock("../src/models", () => ({
  Player: { findByPk: jest.fn() },
}));

const jwt = require("jsonwebtoken");
const { Player } = require("../src/models");
const auth = require("../src/middlewares/auth.middleware");

function makeReq(authHeader) {
  return { headers: { authorization: authHeader } };
}

describe("auth.middleware (Result Monad integration)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "testsecret";
  });

  test("Missing token -> UnauthorizedError", (done) => {
    const req = makeReq(undefined);
    auth(req, {}, (err) => {
      expect(err).toBeTruthy();
      expect(err.message).toMatch(/Missing or invalid token/i);
      done();
    });
  });

  test("Invalid jwt -> UnauthorizedError", (done) => {
    jwt.verify.mockImplementation((t, s, cb) => cb(new Error("bad"), null));

    const req = makeReq("Bearer x");
    auth(req, {}, (err) => {
      expect(err).toBeTruthy();
      expect(err.message).toBe("Invalid token");
      done();
    });
  });

  test("User not found -> UnauthorizedError", (done) => {
    jwt.verify.mockImplementation((t, s, cb) =>
      cb(null, { id: 1, tokenVersion: 0 }),
    );
    Player.findByPk.mockResolvedValue(null);

    const req = makeReq("Bearer good");
    auth(req, {}, (err) => {
      expect(err).toBeTruthy();
      expect(err.message).toBe("Invalid token");
      done();
    });
  });

  test("Token version mismatch -> UnauthorizedError", (done) => {
    jwt.verify.mockImplementation((t, s, cb) =>
      cb(null, { id: 1, tokenVersion: 2 }),
    );
    Player.findByPk.mockResolvedValue({
      id: 1,
      username: "u",
      tokenVersion: 1,
    });

    const req = makeReq("Bearer good");
    auth(req, {}, (err) => {
      expect(err).toBeTruthy();
      expect(err.message).toBe("Invalid token");
      done();
    });
  });

  test("OK -> req.user seteado", (done) => {
    jwt.verify.mockImplementation((t, s, cb) =>
      cb(null, { id: 1, tokenVersion: 0 }),
    );
    Player.findByPk.mockResolvedValue({
      id: 1,
      username: "u",
      tokenVersion: 0,
    });

    const req = makeReq("Bearer good");
    auth(req, {}, (err) => {
      expect(err).toBeFalsy();
      expect(req.user).toEqual({ id: 1, username: "u" });
      done();
    });
  });
});
