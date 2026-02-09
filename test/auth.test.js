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
});
