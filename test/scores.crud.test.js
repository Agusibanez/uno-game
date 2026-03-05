const request = require("supertest");
const app = require("../src/app");
const { registerAndLogin, createGame } = require("./helpers/factories");

describe("Scores CRUD", () => {
  test("Create score OK (4)", async () => {
    const { token } = await registerAndLogin({
      username: "owner",
      email: "owner@mail.com",
    });

    const playerRes = await request(app).post("/api/players").send({
      name: "P1",
      age: 20,
      email: "p1@mail.com",
    });

    const gameId = await createGame({
      token,
      title: "Game Scores",
      maxPlayers: 4,
    });

    const res = await request(app).post("/api/scores").send({
      playerId: playerRes.body.id,
      gameId,
      score: 10,
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.score).toBe(10);
  });

  test("Read / Update / Delete score (4)", async () => {
    const { token } = await registerAndLogin({
      username: "owner",
      email: "owner@mail.com",
    });

    const playerRes = await request(app).post("/api/players").send({
      name: "P1",
      age: 20,
      email: "p1@mail.com",
    });

    const gameId = await createGame({
      token,
      title: "Game Scores",
      maxPlayers: 4,
    });

    const created = await request(app).post("/api/scores").send({
      playerId: playerRes.body.id,
      gameId,
      score: 10,
    });

    const read = await request(app).get(`/api/scores/${created.body.id}`);
    expect(read.status).toBe(200);

    const upd = await request(app).put(`/api/scores/${created.body.id}`).send({
      score: 99,
    });

    expect(upd.status).toBe(200);
    expect(upd.body.score).toBe(99);

    const del = await request(app).delete(`/api/scores/${created.body.id}`);
    expect(del.status).toBe(200);

    const read2 = await request(app).get(`/api/scores/${created.body.id}`);
    expect(read2.status).toBe(404);
  });

  describe("Scores CRUD - Negative / Edge", () => {
    test("Create score invalid body -> 400", async () => {
      const res = await request(app).post("/api/scores").send("no-json");
      expect(res.status).toBe(400);
    });

    test("Create score invalid score type -> 400", async () => {
      const res = await request(app).post("/api/scores").send({
        playerId: 1,
        gameId: 1,
        score: "10",
      });
      expect(res.status).toBe(400);
    });

    test("Create score invalid playerId -> 404", async () => {
      const res = await request(app).post("/api/scores").send({
        playerId: 999999,
        gameId: 1,
        score: 10,
      });
      expect(res.status).toBe(404);
    });

    test("Get score not found -> 404", async () => {
      const res = await request(app).get("/api/scores/999999");
      expect(res.status).toBe(404);
    });
  });
});
