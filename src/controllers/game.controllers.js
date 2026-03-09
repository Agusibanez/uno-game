const service = require("../services/game.service");
const asyncHandler = require("../utils/async-handler");
const gameRulesService = require("../services/game.rules.service");
const {
  requireParamInt,
  requireAuthUserId,
  parseIntParam,
} = require("../utils/http-params");

const create = asyncHandler(async (req, res) => {
  const userId = requireAuthUserId(req, res);
  if (userId === null) return;

  const result = await service.createGame(userId, req.body);
  res
    .status(201)
    .json({ message: "Partida creada correctamente", game_id: result.game_id });
});

const read = asyncHandler(async (req, res) => {
  const id = requireParamInt(req, res, "id");
  if (id === null) return;

  res.json(await service.getGame(id));
});

const update = asyncHandler(async (req, res) => {
  const id = requireParamInt(req, res, "id");
  if (id === null) return;

  res.json(await service.updateGame(id, req.body));
});

const remove = asyncHandler(async (req, res) => {
  const id = requireParamInt(req, res, "id");
  if (id === null) return;

  await service.deleteGame(id);
  res.json({ message: "Partida eliminada" });
});

const join = asyncHandler(async (req, res) => {
  const gameId = requireParamInt(req, res, "id");
  if (gameId === null) return;

  const userId = requireAuthUserId(req, res);
  if (userId === null) return;

  const result = await service.joinGame(gameId, userId);
  if (result.alreadyJoined) {
    return res.json({ message: "Ya estabas en la partida" });
  }
  res.json({ message: "Te uniste a la partida correctamente" });
});

const ready = asyncHandler(async (req, res) => {
  const gameId = requireParamInt(req, res, "id");
  if (gameId === null) return;

  const userId = requireAuthUserId(req, res);
  if (userId === null) return;

  await service.readyGame(gameId, userId);
  res.json({ message: "Jugador listo" });
});

const start = asyncHandler(async (req, res) => {
  const gameId = requireParamInt(req, res, "id");
  if (gameId === null) return;

  const userId = requireAuthUserId(req, res);
  if (userId === null) return;

  await service.startGame(gameId, userId);
  res.json({ message: "Partida iniciada correctamente" });
});

const leave = asyncHandler(async (req, res) => {
  const gameId = requireParamInt(req, res, "id");
  if (gameId === null) return;

  const userId = requireAuthUserId(req, res);
  if (userId === null) return;

  await service.leaveGame(gameId, userId);
  res.json({ message: "Saliste de la partida correctamente" });
});

const end = asyncHandler(async (req, res) => {
  const gameId = requireParamInt(req, res, "id");
  if (gameId === null) return;

  const userId = requireAuthUserId(req, res);
  if (userId === null) return;

  await service.endGame(gameId, userId);
  res.json({ message: "Partida finalizada correctamente" });
});

const rematch = asyncHandler(async (req, res) => {
  const gameId = requireParamInt(req, res, "id");
  if (gameId === null) return;

  const userId = requireAuthUserId(req, res);
  if (userId === null) return;

  await service.rematchGame(gameId, userId);
  res.json({ message: "Nueva ronda iniciada. Puntajes conservados." });
});

const state = asyncHandler(async (req, res) => {
  const gameId = requireParamInt(req, res, "id");
  if (gameId === null) return;

  res.json(await service.getGameState(gameId));
});

const players = asyncHandler(async (req, res) => {
  const gameId = requireParamInt(req, res, "id");
  if (gameId === null) return;

  res.json(await service.getGamePlayers(gameId));
});

const currentPlayer = asyncHandler(async (req, res) => {
  const gameId = requireParamInt(req, res, "id");
  if (gameId === null) return;

  res.json(await service.getCurrentPlayer(gameId));
});

const topCard = asyncHandler(async (req, res) => {
  const gameId = requireParamInt(req, res, "id");
  if (gameId === null) return;

  res.json(await service.getTopCard(gameId));
});

const scores = asyncHandler(async (req, res) => {
  const gameId = requireParamInt(req, res, "id");
  if (gameId === null) return;

  res.json(await service.getGameScores(gameId));
});

const deal = asyncHandler(async (req, res) => {
  const gameId = requireParamInt(req, res, "id");
  if (gameId === null) return;

  const actorId = requireAuthUserId(req, res);
  if (actorId === null) return;

  const result = await gameRulesService.dealCards(gameId, actorId, req.body);
  res.status(200).json(result);
});

const playCard = asyncHandler(async (req, res) => {
  const gameId = requireParamInt(req, res, "id");
  if (gameId === null) return;

  const playerId = requireAuthUserId(req, res);
  if (playerId === null) return;

  const result = await gameRulesService.playCard(gameId, playerId, req.body);
  res.json(result);
});

const drawCard = asyncHandler(async (req, res) => {
  const gameId = requireParamInt(req, res, "id");
  if (gameId === null) return;

  const playerId = requireAuthUserId(req, res);
  if (playerId === null) return;

  const result = await gameRulesService.drawCard(gameId, playerId);
  res.json(result);
});

const sayUno = asyncHandler(async (req, res) => {
  const gameId = requireParamInt(req, res, "id");
  if (gameId === null) return;

  const playerId = requireAuthUserId(req, res);
  if (playerId === null) return;

  const result = await gameRulesService.sayUno(gameId, playerId);
  res.json(result);
});

const challengeUno = asyncHandler(async (req, res) => {
  const gameId = requireParamInt(req, res, "id");
  if (gameId === null) return;

  const challengerId = requireAuthUserId(req, res);
  if (challengerId === null) return;

  const challenged = parseIntParam(req.body?.challengedPlayerId);
  if (challenged === null) {
    return res.status(400).json({ message: "challengedPlayerId invalido" });
  }

  const result = await gameRulesService.challengeUno(
    gameId,
    challengerId,
    challenged,
  );

  res.json(result);
});

const fullStatus = asyncHandler(async (req, res) => {
  const gameId = requireParamInt(req, res, "id");
  if (gameId === null) return;

  const result = await gameRulesService.getFullStatus(gameId);
  res.json(result);
});

const myHand = asyncHandler(async (req, res) => {
  const gameId = requireParamInt(req, res, "id");
  if (gameId === null) return;

  const userId = requireAuthUserId(req, res);
  if (userId === null) return;

  const result = await gameRulesService.getMyHand(gameId, userId);
  res.json(result);
});

module.exports = {
  create,
  read,
  update,
  remove,
  join,
  ready,
  start,
  leave,
  end,
  rematch,
  state,
  players,
  currentPlayer,
  topCard,
  scores,
  deal,
  playCard,
  drawCard,
  sayUno,
  challengeUno,
  fullStatus,
  myHand,
};
