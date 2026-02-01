const { HttpError } = require("../utils/errors");
const { Game, Card, GamePlayer, Player, Score } = require("../models");

function validateGameInput(data, { partial = false } = {}) {
  const errors = [];

  if (!partial || data.title !== undefined) {
    if (typeof data.title !== "string" || data.title.trim().length < 2) {
      errors.push({
        field: "title",
        message: "title must be a string (min 2 chars)",
      });
    }
  }

  if (!partial || data.status !== undefined) {
    if (typeof data.status !== "string" || data.status.trim().length < 3) {
      errors.push({ field: "status", message: "status must be a string" });
    }
  }

  if (!partial || data.maxPlayers !== undefined) {
    if (typeof data.maxPlayers !== "number" || data.maxPlayers < 2) {
      errors.push({
        field: "maxPlayers",
        message: "maxPlayers must be a number >= 2",
      });
    }
  }

  if (errors.length) throw new HttpError(400, "Validation error", errors);
}

function buildBasicDeck(gameId) {
  const colors = ["red", "blue", "green", "yellow"];
  const cards = [];

  for (const c of colors) {
    for (let n = 1; n <= 9; n++) {
      cards.push({ color: c, value: String(n), gameId });
    }
    cards.push({ color: c, value: "skip", gameId });
    cards.push({ color: c, value: "reverse", gameId });
    cards.push({ color: c, value: "+2", gameId });
  }

  cards.push({ color: "black", value: "wild", gameId });
  cards.push({ color: "black", value: "wild+4", gameId });

  return cards;
}

async function createGame(ownerId, payload) {
  validateGameInput(payload);

  const created = await Game.create({
    title: payload.title,
    maxPlayers: payload.maxPlayers,
    status: payload.status || "waiting",
    ownerId,
  });

  const deck = buildBasicDeck(created.id);
  await Card.bulkCreate(deck);

  return { message: "Game created successfully", game_id: created.id };
}

async function getGame(id) {
  const game = await Game.findByPk(id);
  if (!game) throw new HttpError(404, "Game not found");
  return game;
}

async function updateGame(id, payload) {
  validateGameInput(payload, { partial: true });
  const game = await getGame(id);
  await game.update(payload);
  return game;
}

async function deleteGame(id) {
  const game = await getGame(id);
  await Card.destroy({ where: { gameId: id } });
  await game.destroy();
  return { message: "Game deleted" };
}

async function joinGame(gameId, playerId) {
  const game = await Game.findByPk(gameId, {
    include: [{ model: Player, as: "players" }],
  });

  if (!game) throw new HttpError(404, "Game not found");

  if (game.status !== "waiting") {
    throw new HttpError(409, "Game already started");
  }

  if (game.players.length >= game.maxPlayers) {
    throw new HttpError(409, "Game is full");
  }

  const alreadyJoined = await GamePlayer.findOne({
    where: { gameId, playerId },
  });

  if (alreadyJoined) {
    throw new HttpError(409, "Player already joined the game");
  }

  await GamePlayer.create({ gameId, playerId });
  const existingScore = await Score.findOne({
    where: { gameId, playerId },
  });

  if (!existingScore) {
    await Score.create({
      gameId,
      playerId,
      score: 0,
    });
  }

  return { message: "User joined the game successfully" };
}

async function readyGame(gameId, playerId) {
  const game = await Game.findByPk(gameId);
  if (!game) throw new HttpError(404, "Game not found");

  if (game.status !== "waiting") {
    throw new HttpError(409, "Game already started");
  }

  const gp = await GamePlayer.findOne({ where: { gameId, playerId } });
  if (!gp) throw new HttpError(404, "Player not in game");

  gp.isReady = true;
  await gp.save();

  return { message: "Player is ready" };
}

async function startGame(gameId, playerId) {
  const game = await Game.findByPk(gameId);
  if (!game) throw new HttpError(404, "Game not found");

  if (!game.ownerId || game.ownerId !== playerId) {
    throw new HttpError(403, "Only the game owner can start the game");
  }

  if (game.status !== "waiting") {
    throw new HttpError(409, "Game already started");
  }

  const players = await GamePlayer.findAll({
    where: { gameId },
    order: [["createdAt", "ASC"]],
  });

  if (players.length < 2) {
    throw new HttpError(409, "Not enough players to start");
  }

  const allReady = players.every((p) => p.isReady === true);
  if (!allReady) {
    throw new HttpError(409, "Not all players are ready");
  }

  game.currentPlayerId = players[0].playerId;
  game.status = "started";

  const firstCard = await Card.findOne({ where: { gameId } });
  if (firstCard) {
    game.discardTopColor = firstCard.color;
    game.discardTopValue = firstCard.value;
  }

  await game.save();

  return { message: "Game started successfully" };
}

async function leaveGame(gameId, playerId) {
  const game = await Game.findByPk(gameId);
  if (!game) throw new HttpError(404, "Game not found");

  const gp = await GamePlayer.findOne({ where: { gameId, playerId } });
  if (!gp) throw new HttpError(404, "Player not in game");

  await gp.destroy();

  // aca podria crear una logica para reasignar el ownerId si el owner se va o que el juego termine si el owner se retira

  return { message: "User left the game successfully" };
}

async function endGame(gameId, playerId) {
  const game = await Game.findByPk(gameId);
  if (!game) throw new HttpError(404, "Game not found");

  if (!game.ownerId || game.ownerId !== playerId) {
    throw new HttpError(403, "Only the game owner can end the game");
  }

  if (game.status === "ended") {
    throw new HttpError(409, "Game already ended");
  }

  game.status = "ended";
  await game.save();

  return { message: "Game ended successfully" };
}

async function getGameState(gameId) {
  const game = await Game.findByPk(gameId, { attributes: ["id", "status"] });
  if (!game) throw new HttpError(404, "Game not found");
  return { game_id: game.id, state: game.status };
}

async function getGamePlayers(gameId) {
  const game = await Game.findByPk(gameId, {
    include: [
      { model: Player, as: "players", attributes: ["username", "name"] },
    ],
  });
  if (!game) throw new HttpError(404, "Game not found");

  const names = game.players.map((p) => p.username || p.name);
  return { game_id: game.id, players: names };
}

async function getCurrentPlayer(gameId) {
  const game = await Game.findByPk(gameId, {
    attributes: ["id", "currentPlayerId"],
    include: [
      { model: Player, as: "currentPlayer", attributes: ["username", "name"] },
    ],
  });
  if (!game) throw new HttpError(404, "Game not found");

  const name = game.currentPlayer
    ? game.currentPlayer.username || game.currentPlayer.name
    : null;

  return { game_id: game.id, current_player: name };
}

async function getTopCard(gameId) {
  const game = await Game.findByPk(gameId, {
    attributes: ["id", "discardTopColor", "discardTopValue"],
  });
  if (!game) throw new HttpError(404, "Game not found");

  const top =
    game.discardTopColor && game.discardTopValue
      ? `${game.discardTopColor}:${game.discardTopValue}`
      : null;

  return { game_id: game.id, top_card: top };
}

async function getGameScores(gameId) {
  const game = await Game.findByPk(gameId, { attributes: ["id"] });
  if (!game) throw new HttpError(404, "Game not found");

  const gps = await GamePlayer.findAll({
    where: { gameId },
    include: [
      { model: Player, as: "player", attributes: ["id", "username", "name"] },
    ],
  });

  const rows = await Score.findAll({ where: { gameId } });
  const scoreByPlayerId = new Map(rows.map((r) => [r.playerId, r.score]));

  const scores = {};
  for (const gp of gps) {
    const p = gp.player;
    const key = p?.username || p?.name || `player_${gp.playerId}`;
    scores[key] = scoreByPlayerId.get(gp.playerId) ?? 0;
  }

  return { game_id: game.id, scores };
}

module.exports = {
  createGame,
  getGame,
  updateGame,
  deleteGame,
  joinGame,
  readyGame,
  startGame,
  leaveGame,
  endGame,
  getGameState,
  getGamePlayers,
  getCurrentPlayer,
  getTopCard,
  getGameScores,
};
