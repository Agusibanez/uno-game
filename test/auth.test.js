const request = require("supertest");
const app = require("../src/app");
const { registerAndLogin } = require("./helpers/factories");

describe("Auth", () => {
  test("Register user OK (6)", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "agus",
      email: "agus@mail.com",
      password: "secret123",
    });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ message: "User registered successfully" });
  });

  test("Register invalid body -> 400 (6)", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "a",
      email: "badmail",
      password: "1",
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation error");
  });

  test("Login OK returns token (7)", async () => {
    await request(app).post("/api/auth/register").send({
      username: "agus",
      email: "agus@mail.com",
      password: "secret123",
    });

    const res = await request(app).post("/api/auth/login").send({
      username: "agus",
      password: "secret123",
    });

    expect(res.status).toBe(200);
    expect(typeof res.body.access_token).toBe("string");
  });

  test("Login invalid -> 401 (7)", async () => {
    const res = await request(app).post("/api/auth/login").send({
      username: "nope",
      password: "nope",
    });

    expect(res.status).toBe(401);
  });

  test("Me OK (9)", async () => {
    const { token } = await registerAndLogin({
      username: "meuser",
      email: "meuser@mail.com",
    });

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("username", "meuser");
    expect(res.body).toHaveProperty("email", "meuser@mail.com");
  });

  test("Logout invalidates token (8)", async () => {
    const { token } = await registerAndLogin({
      username: "logoutuser",
      email: "logout@mail.com",
    });

    const logoutRes = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${token}`);
    expect(logoutRes.status).toBe(200);

    const meRes = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(meRes.status).toBe(401);
  });
  describe("Auth - Negative / Edge", () => {
    test("Register missing fields -> 400", async () => {
      const res = await request(app).post("/api/auth/register").send({
        username: "ab",
        // email missing
        password: "password123",
      });
      expect(res.status).toBe(400);
    });

    test("Register invalid email -> 400", async () => {
      const res = await request(app).post("/api/auth/register").send({
        username: "alice",
        email: "no-es-email",
        password: "password123",
      });
      expect(res.status).toBe(400);
    });

    test("Register short password -> 400", async () => {
      const res = await request(app).post("/api/auth/register").send({
        username: "alice",
        email: "alice2@example.com",
        password: "123",
      });
      expect(res.status).toBe(400);
    });

    test("Login missing body -> 400", async () => {
      const res = await request(app).post("/api/auth/login").send();
      expect(res.status).toBe(400);
    });

    test("Login invalid credentials -> 401", async () => {
      const res = await request(app).post("/api/auth/login").send({
        username: "noexiste",
        password: "password123",
      });
      expect(res.status).toBe(401);
    });

    test("Me without token -> 401", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(401);
    });

    test("Logout without token -> 401", async () => {
      const res = await request(app).post("/api/auth/logout");
      expect(res.status).toBe(401);
    });

    test("Me with invalid token -> 401", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid.token.here");
      expect(res.status).toBe(401);
    });
  });
});
