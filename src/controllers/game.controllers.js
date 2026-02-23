const service = require("../services/game.service");
const asyncHandler = require("../utils/async-handler");
const gameRulesService = require("../services/game.rules.service");

const create = asyncHandler(async (req, res) => {
  const result = await service.createGame(req.user.id, req.body);
  res
    .status(201)
    .json({ message: "Game created successfully", game_id: result.game_id });
});

const read = asyncHandler(async (req, res) => {
  res.json(await service.getGame(req.params.id));
});

const update = asyncHandler(async (req, res) => {
  res.json(await service.updateGame(req.params.id, req.body));
});

const remove = asyncHandler(async (req, res) => {
  await service.deleteGame(req.params.id);
  res.json({ message: "Game deleted" });
});

const join = asyncHandler(async (req, res) => {
  await service.joinGame(Number(req.params.id), req.user.id);
  res.json({ message: "User joined the game successfully" });
});

const ready = asyncHandler(async (req, res) => {
  await service.readyGame(Number(req.params.id), req.user.id);
  res.json({ message: "Player is ready" });
});

const start = asyncHandler(async (req, res) => {
  await service.startGame(Number(req.params.id), req.user.id);
  res.json({ message: "Game started successfully" });
});

const leave = asyncHandler(async (req, res) => {
  await service.leaveGame(Number(req.params.id), req.user.id);
  res.json({ message: "User left the game successfully" });
});

const end = asyncHandler(async (req, res) => {
  await service.endGame(Number(req.params.id), req.user.id);
  res.json({ message: "Game ended successfully" });
});

const state = asyncHandler(async (req, res) => {
  res.json(await service.getGameState(Number(req.params.id)));
});

const players = asyncHandler(async (req, res) => {
  res.json(await service.getGamePlayers(Number(req.params.id)));
});

const currentPlayer = asyncHandler(async (req, res) => {
  res.json(await service.getCurrentPlayer(Number(req.params.id)));
});

const topCard = asyncHandler(async (req, res) => {
  res.json(await service.getTopCard(Number(req.params.id)));
});

const scores = asyncHandler(async (req, res) => {
  res.json(await service.getGameScores(Number(req.params.id)));
});

async function deal(req, res, next) {
  try {
    const gameId = Number(req.params.id);
    const actorId = req.user.id;

    const result = await gameRulesService.dealCards(gameId, actorId, req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

const playCard = asyncHandler(async (req, res) => {
  const gameId = Number(req.params.id);
  const playerId = req.user.id;

  const result = await gameRulesService.playCard(gameId, playerId, req.body);

  res.json(result);
});

const drawCard = asyncHandler(async (req, res) => {
  const gameId = Number(req.params.id);
  const playerId = req.user.id;

  const result = await gameRulesService.drawCard(gameId, playerId);
  res.json(result);
});

const sayUno = asyncHandler(async (req, res) => {
  const gameId = Number(req.params.id);
  const playerId = req.user.id;

  const result = await gameRulesService.sayUno(gameId, playerId);
  res.json(result);
});

const challengeUno = asyncHandler(async (req, res) => {
  const gameId = Number(req.params.id);
  const challengerId = req.user.id;
  const { challengedPlayerId } = req.body;

  const result = await gameRulesService.challengeUno(
    gameId,
    challengerId,
    challengedPlayerId,
  );

  res.json(result);
});

const fullStatus = asyncHandler(async (req, res) => {
  const result = await gameRulesService.getFullStatus(Number(req.params.id));
  res.json(result);
});

const myHand = asyncHandler(async (req, res) => {
  const result = await gameRulesService.getMyHand(
    Number(req.params.id),
    req.user.id,
  );
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
