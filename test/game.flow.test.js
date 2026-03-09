const request = require("supertest");
const app = require("../src/app");
const { registerAndLogin, createGame } = require("./helpers/factories");

describe("Game Flow", () => {
  test("Join game OK (11) y players list (16)", async () => {
    const owner = await registerAndLogin({
      username: "owner_join",
      email: "owner_join@mail.com",
    });
    const p2 = await registerAndLogin({
      username: "p2_join",
      email: "p2_join@mail.com",
    });

    const gameId = await createGame({
      token: owner.token,
      title: "Game Flow Join",
      maxPlayers: 4,
    });

    const join = await request(app)
      .post(`/api/games/${gameId}/join`)
      .set("Authorization", `Bearer ${p2.token}`);

    expect(join.status).toBe(200);
    expect(join.body).toEqual({ message: "Te uniste a la partida correctamente" });

    const players = await request(app).get(`/api/games/${gameId}/players`);
    expect(players.status).toBe(200);
    expect(players.body.players).toContain("p2_join");
  });

  test("Start game when ready (12) + state (15) + current player (17) + top card (18)", async () => {
    const owner = await registerAndLogin({
      username: "owner_start",
      email: "owner_start@mail.com",
    });
    const p2 = await registerAndLogin({
      username: "p2_start",
      email: "p2_start@mail.com",
    });

    const gameId = await createGame({
      token: owner.token,
      title: "Game Flow Start",
      maxPlayers: 4,
    });

    await request(app)
      .post(`/api/games/${gameId}/join`)
      .set("Authorization", `Bearer ${p2.token}`);

    await request(app)
      .post(`/api/games/${gameId}/ready`)
      .set("Authorization", `Bearer ${owner.token}`);

    await request(app)
      .post(`/api/games/${gameId}/ready`)
      .set("Authorization", `Bearer ${p2.token}`);

    const start = await request(app)
      .post(`/api/games/${gameId}/start`)
      .set("Authorization", `Bearer ${owner.token}`);

    expect(start.status).toBe(200);
    expect(start.body).toEqual({ message: "Partida iniciada correctamente" });

    const state = await request(app).get(`/api/games/${gameId}/state`);
    expect(state.status).toBe(200);
    expect(state.body.state).toBe("started");

    const current = await request(app).get(
      `/api/games/${gameId}/current-player`,
    );
    expect(current.status).toBe(200);
    expect(current.body.current_player).not.toBe(null);

    const top = await request(app).get(`/api/games/${gameId}/top-card`);
    expect(top.status).toBe(200);
    expect(top.body).toHaveProperty("top_card");
  });

  test("Leave game (13)", async () => {
    const owner = await registerAndLogin({
      username: "owner_leave",
      email: "owner_leave@mail.com",
    });
    const p2 = await registerAndLogin({
      username: "p2_leave",
      email: "p2_leave@mail.com",
    });

    const gameId = await createGame({
      token: owner.token,
      title: "Game Flow Leave",
      maxPlayers: 4,
    });

    await request(app)
      .post(`/api/games/${gameId}/join`)
      .set("Authorization", `Bearer ${p2.token}`);

    const leave = await request(app)
      .post(`/api/games/${gameId}/leave`)
      .set("Authorization", `Bearer ${p2.token}`);

    expect(leave.status).toBe(200);
    expect(leave.body).toEqual({ message: "Saliste de la partida correctamente" });
  });

  test("End game (14)", async () => {
    const owner = await registerAndLogin({
      username: "owner_end",
      email: "owner_end@mail.com",
    });

    const gameId = await createGame({
      token: owner.token,
      title: "Game Flow End",
      maxPlayers: 4,
    });

    const end = await request(app)
      .post(`/api/games/${gameId}/end`)
      .set("Authorization", `Bearer ${owner.token}`);

    expect(end.status).toBe(200);
    expect(end.body).toEqual({ message: "Partida finalizada correctamente" });
  });

  test("Scores endpoint (19): returns scores map", async () => {
    const owner = await registerAndLogin({
      username: "owner_scores",
      email: "owner_scores@mail.com",
    });
    const p2 = await registerAndLogin({
      username: "p2_scores",
      email: "p2_scores@mail.com",
    });

    const gameId = await createGame({
      token: owner.token,
      title: "Game Flow Scores",
      maxPlayers: 4,
    });

    await request(app)
      .post(`/api/games/${gameId}/join`)
      .set("Authorization", `Bearer ${p2.token}`);

    const scores = await request(app).get(`/api/games/${gameId}/scores`);
    expect(scores.status).toBe(200);
    expect(scores.body).toHaveProperty("scores");
    expect(typeof scores.body.scores).toBe("object");
  });

  describe("Game Flow - Negative / Edge", () => {
    test("Join twice -> 200 (idempotente)", async () => {
      const owner = await registerAndLogin({
        username: "owner_dup",
        email: "owner_dup@mail.com",
      });
      const p1 = await registerAndLogin({
        username: "p_dup",
        email: "p_dup@mail.com",
      });

      const gameId = await createGame({
        token: owner.token,
        title: "G-DUP",
        maxPlayers: 2,
      });

      const j1 = await request(app)
        .post(`/api/games/${gameId}/join`)
        .set("Authorization", `Bearer ${p1.token}`);
      expect(j1.status).toBe(200);

      const j2 = await request(app)
        .post(`/api/games/${gameId}/join`)
        .set("Authorization", `Bearer ${p1.token}`);
      expect(j2.status).toBe(200);
      expect(j2.body).toEqual({ message: "Ya estabas en la partida" });
    });

    test("Start not owner -> 403", async () => {
      const owner = await registerAndLogin({
        username: "owner_forb",
        email: "owner_forb@mail.com",
      });
      const p1 = await registerAndLogin({
        username: "p_forb",
        email: "p_forb@mail.com",
      });

      const gameId = await createGame({
        token: owner.token,
        title: "G-FORB",
        maxPlayers: 2,
      });

      await request(app)
        .post(`/api/games/${gameId}/join`)
        .set("Authorization", `Bearer ${p1.token}`);

      await request(app)
        .post(`/api/games/${gameId}/ready`)
        .set("Authorization", `Bearer ${owner.token}`);
      await request(app)
        .post(`/api/games/${gameId}/ready`)
        .set("Authorization", `Bearer ${p1.token}`);

      const start = await request(app)
        .post(`/api/games/${gameId}/start`)
        .set("Authorization", `Bearer ${p1.token}`);

      expect(start.status).toBe(403);
    });

    test("Start without enough players -> 409", async () => {
      const owner = await registerAndLogin({
        username: "owner_np",
        email: "owner_np@mail.com",
      });

      const gameId = await createGame({
        token: owner.token,
        title: "G-NP",
        maxPlayers: 2,
      });

      await request(app)
        .post(`/api/games/${gameId}/ready`)
        .set("Authorization", `Bearer ${owner.token}`);

      const start = await request(app)
        .post(`/api/games/${gameId}/start`)
        .set("Authorization", `Bearer ${owner.token}`);

      expect(start.status).toBe(409);
    });

    test("Join non-existing game -> 404", async () => {
      const p1 = await registerAndLogin({
        username: "p_404",
        email: "p_404@mail.com",
      });

      const join = await request(app)
        .post(`/api/games/999999/join`)
        .set("Authorization", `Bearer ${p1.token}`);

      expect(join.status).toBe(404);
    });

    test("Ready without token -> 401", async () => {
      const res = await request(app).post(`/api/games/1/ready`);
      expect(res.status).toBe(401);
    });
  });
});
