const request = require("supertest");
const app = require("../src/app");
const { registerAndLogin } = require("./helpers/factories");

describe("Games CRUD", () => {
  test("Create game OK (2,10)", async () => {
    const { token } = await registerAndLogin({
      username: "owner",
      email: "owner@mail.com",
    });

    const res = await request(app)
      .post("/api/games")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Game A", maxPlayers: 4 });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("game_id");
  });

  test("Read game OK (2)", async () => {
    const { token } = await registerAndLogin({
      username: "owner",
      email: "owner@mail.com",
    });

    const created = await request(app)
      .post("/api/games")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Game A", maxPlayers: 4 });

    const res = await request(app).get(`/api/games/${created.body.game_id}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", created.body.game_id);
  });

  test("Update game OK (2)", async () => {
    const { token } = await registerAndLogin({
      username: "owner",
      email: "owner@mail.com",
    });

    const created = await request(app)
      .post("/api/games")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Game A", maxPlayers: 4 });

    const res = await request(app)
      .put(`/api/games/${created.body.game_id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Game Updated" });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Game Updated");
  });

  test("Delete game OK (2)", async () => {
    const { token } = await registerAndLogin({
      username: "owner",
      email: "owner@mail.com",
    });

    const created = await request(app)
      .post("/api/games")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Game A", maxPlayers: 4 });

    const del = await request(app).delete(`/api/games/${created.body.game_id}`);
    expect(del.status).toBe(200);

    const read = await request(app).get(`/api/games/${created.body.game_id}`);
    expect(read.status).toBe(404);
  });
});
