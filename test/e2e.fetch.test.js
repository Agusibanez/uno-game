const app = require("../src/app");

let server;
let baseUrl;

beforeAll(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", resolve);
  });
  const addr = server.address();
  baseUrl = `http://127.0.0.1:${addr.port}/api`;
});

afterAll(async () => {
  if (!server) return;
  await new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

async function apiFetch(path, { method = "GET", token, body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = {};
  try {
    data = await res.json();
  } catch (_) {
    data = {};
  }

  return { status: res.status, data };
}

async function registerAndLogin({ username, email, password = "secret123" }) {
  const reg = await apiFetch("/auth/register", {
    method: "POST",
    body: { username, email, password },
  });
  expect(reg.status).toBe(201);

  const login = await apiFetch("/auth/login", {
    method: "POST",
    body: { username, password },
  });
  expect(login.status).toBe(200);
  expect(typeof login.data.access_token).toBe("string");

  const me = await apiFetch("/auth/me", {
    token: login.data.access_token,
  });
  expect(me.status).toBe(200);

  return { token: login.data.access_token, me: me.data, username };
}

async function setupStartedGame({ cardsPerPlayer = 7 } = {}) {
  const owner = await registerAndLogin({
    username: "owner_e2e",
    email: "owner_e2e@mail.com",
  });
  const p2 = await registerAndLogin({
    username: "p2_e2e",
    email: "p2_e2e@mail.com",
  });

  const create = await apiFetch("/games", {
    method: "POST",
    token: owner.token,
    body: { title: "UNO E2E", maxPlayers: 4 },
  });
  expect(create.status).toBe(201);
  const gameId = create.data.game_id;

  const join = await apiFetch(`/games/${gameId}/join`, {
    method: "POST",
    token: p2.token,
  });
  expect(join.status).toBe(200);

  const ownerReady = await apiFetch(`/games/${gameId}/ready`, {
    method: "POST",
    token: owner.token,
  });
  expect(ownerReady.status).toBe(200);

  const p2Ready = await apiFetch(`/games/${gameId}/ready`, {
    method: "POST",
    token: p2.token,
  });
  expect(p2Ready.status).toBe(200);

  const start = await apiFetch(`/games/${gameId}/start`, {
    method: "POST",
    token: owner.token,
  });
  expect(start.status).toBe(200);

  const deal = await apiFetch(`/games/${gameId}/deal`, {
    method: "POST",
    token: owner.token,
    body: { cardsPerPlayer },
  });
  expect(deal.status).toBe(200);

  return { gameId, owner, p2 };
}

describe("E2E (fetch) - UNO API", () => {
  test("1) Autenticacion: register/login/me/logout", async () => {
    const auth = await registerAndLogin({
      username: "auth_user",
      email: "auth_user@mail.com",
    });

    const logout = await apiFetch("/auth/logout", {
      method: "POST",
      token: auth.token,
    });
    expect(logout.status).toBe(200);

    const meAfterLogout = await apiFetch("/auth/me", { token: auth.token });
    expect(meAfterLogout.status).toBe(401);
  });

  test("2) Sesion de juego: crear, unir, ready, start y deal", async () => {
    const { gameId, owner, p2 } = await setupStartedGame({ cardsPerPlayer: 7 });

    const ownerHand = await apiFetch(`/games/${gameId}/my-hand`, { token: owner.token });
    const p2Hand = await apiFetch(`/games/${gameId}/my-hand`, { token: p2.token });

    expect(ownerHand.status).toBe(200);
    expect(p2Hand.status).toBe(200);
    expect(ownerHand.data.hand).toHaveLength(7);
    expect(p2Hand.data.hand).toHaveLength(7);
  });

  test("3) Flujo de robo: el jugador de turno puede robar y cambia el turno", async () => {
    const { gameId, owner, p2 } = await setupStartedGame({ cardsPerPlayer: 3 });

    const status = await apiFetch(`/games/${gameId}/status`, { token: owner.token });
    expect(status.status).toBe(200);
    const currentPlayerId = status.data.currentPlayer;

    const currentToken = currentPlayerId === owner.me.id ? owner.token : p2.token;
    const draw = await apiFetch(`/games/${gameId}/draw`, {
      method: "POST",
      token: currentToken,
    });

    expect(draw.status).toBe(200);
    expect(Array.isArray(draw.data.cardsDrawn)).toBe(true);
    expect(draw.data.cardsDrawn.length).toBeGreaterThan(0);
    expect(draw.data.nextPlayer).not.toBe(currentPlayerId);
  });

  test("4) Regla UNO y desafio: success/fail segun estado UNO", async () => {
    const { gameId, owner, p2 } = await setupStartedGame({ cardsPerPlayer: 1 });

    const status1 = await apiFetch(`/games/${gameId}/status`, { token: owner.token });
    const ownerParticipant = status1.data.participants.find((p) => p.playerId === owner.me.id);
    expect(ownerParticipant.handCount).toBe(1);
    expect(ownerParticipant.saidUno).toBe(false);

    const challengeSuccess = await apiFetch(`/games/${gameId}/challenge-uno`, {
      method: "POST",
      token: p2.token,
      body: { challengedPlayerId: owner.me.id },
    });
    expect(challengeSuccess.status).toBe(200);
    expect(challengeSuccess.data.message).toMatch(/Desafio exitoso/i);

    const sayUno = await apiFetch(`/games/${gameId}/uno`, {
      method: "PATCH",
      token: p2.token,
    });
    expect(sayUno.status).toBe(200);

    const challengeFail = await apiFetch(`/games/${gameId}/challenge-uno`, {
      method: "POST",
      token: owner.token,
      body: { challengedPlayerId: p2.me.id },
    });
    expect(challengeFail.status).toBe(200);
    expect(challengeFail.data.message).toMatch(/Desafio fallido/i);
  });

  test("5) Rematch: nueva ronda sin perder puntajes", async () => {
    const { gameId, owner, p2 } = await setupStartedGame({ cardsPerPlayer: 2 });

    const preScores = await apiFetch(`/games/${gameId}/scores`, { token: owner.token });
    expect(preScores.status).toBe(200);
    expect(preScores.data.scores).toHaveProperty(owner.username);
    expect(preScores.data.scores).toHaveProperty(p2.username);

    const end = await apiFetch(`/games/${gameId}/end`, {
      method: "POST",
      token: owner.token,
    });
    expect(end.status).toBe(200);

    const rematch = await apiFetch(`/games/${gameId}/rematch`, {
      method: "POST",
      token: owner.token,
    });
    expect(rematch.status).toBe(200);

    const ownerHand = await apiFetch(`/games/${gameId}/my-hand`, { token: owner.token });
    const p2Hand = await apiFetch(`/games/${gameId}/my-hand`, { token: p2.token });
    expect(ownerHand.status).toBe(200);
    expect(p2Hand.status).toBe(200);
    expect(ownerHand.data.hand).toHaveLength(7);
    expect(p2Hand.data.hand).toHaveLength(7);

    const postScores = await apiFetch(`/games/${gameId}/scores`, { token: owner.token });
    expect(postScores.status).toBe(200);
    expect(postScores.data.scores).toHaveProperty(owner.username);
    expect(postScores.data.scores).toHaveProperty(p2.username);
  });
});
