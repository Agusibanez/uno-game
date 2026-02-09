const request = require("supertest");
const app = require("../src/app");
const { registerAndLogin, createGame } = require("./helpers/factories");

describe("Cards CRUD", () => {
  test("Create card OK (3)", async () => {
    const { token } = await registerAndLogin({
      username: "owner",
      email: "owner@mail.com",
    });

    const gameId = await createGame({
      token,
      title: "Game Cards",
      maxPlayers: 4,
    });

    const res = await request(app).post("/api/cards").send({
      color: "red",
      value: "5",
      gameId,
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.gameId).toBe(gameId);
  });

  test("Read / Update / Delete card (3)", async () => {
    const { token } = await registerAndLogin({
      username: "owner",
      email: "owner@mail.com",
    });

    const gameId = await createGame({
      token,
      title: "Game Cards",
      maxPlayers: 4,
    });

    const created = await request(app).post("/api/cards").send({
      color: "red",
      value: "5",
      gameId,
    });

    const read = await request(app).get(`/api/cards/${created.body.id}`);
    expect(read.status).toBe(200);

    const upd = await request(app).put(`/api/cards/${created.body.id}`).send({
      value: "7",
    });
    expect(upd.status).toBe(200);
    expect(upd.body.value).toBe("7");

    const del = await request(app).delete(`/api/cards/${created.body.id}`);
    expect(del.status).toBe(200);

    const read2 = await request(app).get(`/api/cards/${created.body.id}`);
    expect(read2.status).toBe(404);
  });
});
