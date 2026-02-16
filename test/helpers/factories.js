const request = require("supertest");
const app = require("../../src/app");

async function registerAndLogin({
  username = "user1",
  email = "user1@mail.com",
  password = "secret123",
} = {}) {
  await request(app)
    .post("/api/auth/register")
    .send({ username, email, password });

  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ username, password });

  const token = loginRes.body.access_token;

  return { token, username, email, password };
}

async function createUserAndLogin(username, email, password = "secret123") {
  return registerAndLogin({ username, email, password });
}

async function createGame({ token, title = "Game 1", maxPlayers = 4 } = {}) {
  const res = await request(app)
    .post("/api/games")
    .set("Authorization", `Bearer ${token}`)
    .send({ title, maxPlayers });

  return res.body.game_id;
}

module.exports = { registerAndLogin, createUserAndLogin, createGame };
