const service = require("../services/game.service");
const asyncHandler = require("../utils/async-handler");

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
};
