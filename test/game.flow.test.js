const request = require("supertest");
const app = require("../src/app");
const { registerAndLogin, createGame } = require("./helpers/factories");

describe("Game Flow", () => {
  test("Join game OK (11) y players list (16)", async () => {
    const owner = await registerAndLogin({
      username: "owner",
      email: "owner@mail.com",
    });
    const p2 = await registerAndLogin({ username: "p2", email: "p2@mail.com" });

    const gameId = await createGame({
      token: owner.token,
      title: "Game Flow",
      maxPlayers: 4,
    });

    // p2 se une
    const join = await request(app)
      .post(`/api/games/${gameId}/join`)
      .set("Authorization", `Bearer ${p2.token}`);

    expect(join.status).toBe(200);
    expect(join.body).toEqual({ message: "User joined the game successfully" });

    // players list
    const players = await request(app).get(`/api/games/${gameId}/players`);
    expect(players.status).toBe(200);
    expect(players.body.players).toContain("p2");
  });

  test("Start game when ready (12) + state (15) + current player (17) + top card (18)", async () => {
    const owner = await registerAndLogin({
      username: "owner",
      email: "owner@mail.com",
    });
    const p2 = await registerAndLogin({ username: "p2", email: "p2@mail.com" });

    const gameId = await createGame({
      token: owner.token,
      title: "Game Start",
      maxPlayers: 4,
    });

    await request(app)
      .post(`/api/games/${gameId}/join`)
      .set("Authorization", `Bearer ${p2.token}`);

    // ready owner y p2
    await request(app)
      .post(`/api/games/${gameId}/ready`)
      .set("Authorization", `Bearer ${owner.token}`);

    await request(app)
      .post(`/api/games/${gameId}/ready`)
      .set("Authorization", `Bearer ${p2.token}`);

    // start por owner
    const start = await request(app)
      .post(`/api/games/${gameId}/start`)
      .set("Authorization", `Bearer ${owner.token}`);

    expect(start.status).toBe(200);
    expect(start.body).toEqual({ message: "Game started successfully" });

    // state
    const state = await request(app).get(`/api/games/${gameId}/state`);
    expect(state.status).toBe(200);
    expect(state.body.state).toBe("started");

    // current player
    const current = await request(app).get(
      `/api/games/${gameId}/current-player`,
    );
    expect(current.status).toBe(200);
    expect(current.body.current_player).not.toBe(null);

    // top card
    const top = await request(app).get(`/api/games/${gameId}/top-card`);
    expect(top.status).toBe(200);
    expect(top.body).toHaveProperty("top_card");
  });

  test("Leave game (13)", async () => {
    const owner = await registerAndLogin({
      username: "owner",
      email: "owner@mail.com",
    });
    const p2 = await registerAndLogin({ username: "p2", email: "p2@mail.com" });

    const gameId = await createGame({
      token: owner.token,
      title: "Game Leave",
      maxPlayers: 4,
    });

    await request(app)
      .post(`/api/games/${gameId}/join`)
      .set("Authorization", `Bearer ${p2.token}`);

    const leave = await request(app)
      .post(`/api/games/${gameId}/leave`)
      .set("Authorization", `Bearer ${p2.token}`);

    expect(leave.status).toBe(200);
    expect(leave.body).toEqual({ message: "User left the game successfully" });
  });

  test("End game (14)", async () => {
    const owner = await registerAndLogin({
      username: "owner",
      email: "owner@mail.com",
    });
    const gameId = await createGame({
      token: owner.token,
      title: "Game End",
      maxPlayers: 4,
    });

    const end = await request(app)
      .post(`/api/games/${gameId}/end`)
      .set("Authorization", `Bearer ${owner.token}`);

    expect(end.status).toBe(200);
    expect(end.body).toEqual({ message: "Game ended successfully" });
  });

  test("Scores endpoint (19): returns scores map", async () => {
    const owner = await registerAndLogin({
      username: "owner",
      email: "owner@mail.com",
    });
    const p2 = await registerAndLogin({ username: "p2", email: "p2@mail.com" });

    const gameId = await createGame({
      token: owner.token,
      title: "Game Scores",
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
});
