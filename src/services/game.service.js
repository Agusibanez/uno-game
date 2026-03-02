const {
  NotFoundError,
  ConflictError,
  ForbiddenError,
} = require("../utils/domain-errors");
const {
  gameRepo,
  gamePlayerRepo,
  cardRepo,
  scoreRepo,
} = require("../repositories");

const {
  buildShuffledDeckWithPositions,
} = require("../domain/deck/basic-dec.builder");

async function createGame(ownerId, payload) {
  const realOwnerId = ownerId ?? payload.ownerId ?? payload.playerId;

  if (!realOwnerId) {
    throw new ConflictError("ownerId/playerId is required to create a game");
  }

  const created = await gameRepo.create({
    title: payload.title,
    maxPlayers: payload.maxPlayers,
    status: payload.status || "waiting",
    ownerId: realOwnerId,
  });

  await cardRepo.bulkCreate(buildShuffledDeckWithPositions(created.id));

  await gamePlayerRepo.create({
    gameId: created.id,
    playerId: realOwnerId,
  });

  await scoreRepo.create({
    gameId: created.id,
    playerId: realOwnerId,
    score: 0,
  });

  return { game_id: created.id };
}

async function getGame(id) {
  const game = await gameRepo.findById(id);
  if (!game) throw new NotFoundError("Game not found");
  return game;
}

async function updateGame(id, payload) {
  const game = await gameRepo.findById(id);
  if (!game) throw new NotFoundError("Game not found");

  await gameRepo.updateById(id, payload);
  return gameRepo.findById(id);
}

async function deleteGame(id) {
  const game = await getGame(id);

  await gamePlayerRepo.destroyByGame(id);
  await scoreRepo.destroyByGame(id);
  await cardRepo.destroyByGame(id);

  await gameRepo.destroy(game);

  return { deleted: true };
}

async function joinGame(gameId, playerId) {
  const game = await gameRepo.findByIdWithPlayers(gameId);
  if (!game) throw new NotFoundError("Game not found");

  if (game.status !== "waiting")
    throw new ConflictError("Game already started");
  if (game.players.length >= game.maxPlayers)
    throw new ConflictError("Game is full");

  const alreadyJoined = await gamePlayerRepo.findOne({ gameId, playerId });
  if (alreadyJoined) throw new ConflictError("Player already joined the game");

  await gamePlayerRepo.create({ gameId, playerId });

  const existingScore = await scoreRepo.findOne({ gameId, playerId });
  if (!existingScore) await scoreRepo.create({ gameId, playerId, score: 0 });

  return { joined: true };
}

async function readyGame(gameId, playerId) {
  const game = await gameRepo.findById(gameId);
  if (!game) throw new NotFoundError("Game not found");
  if (game.status !== "waiting")
    throw new ConflictError("Game already started");

  const gp = await gamePlayerRepo.findOne({ gameId, playerId });
  if (!gp) throw new NotFoundError("Player not in game");

  await gamePlayerRepo.setReady(gameId, playerId, true);
  return { ready: true };
}

async function startGame(gameId, playerId) {
  const game = await gameRepo.findById(gameId);
  if (!game) throw new NotFoundError("Game not found");

  if (!game.ownerId || game.ownerId !== playerId)
    throw new ForbiddenError("Only the game owner can start the game");
  if (game.status !== "waiting")
    throw new ConflictError("Game already started");

  const players = await gamePlayerRepo.findAllByGame(gameId);
  if (players.length < 2)
    throw new ConflictError("Not enough players to start");

  const allReady = players.every((p) => p.isReady === true);
  if (!allReady) throw new ConflictError("Not all players are ready");

  game.currentPlayerId = players[0].playerId;
  game.status = "started";

  const firstCard = await cardRepo.findFirstByGame(gameId);
  if (firstCard) {
    await cardRepo.moveToDiscard(firstCard.id);

    if (firstCard.color === "black") {
      const colors = ["red", "blue", "green", "yellow"];
      game.discardTopColor = colors[Math.floor(Math.random() * colors.length)];
    } else {
      game.discardTopColor = firstCard.color;
    }
    game.discardTopValue = firstCard.value;
  }

  await gameRepo.save(game);
  return { started: true };
}

async function leaveGame(gameId, playerId) {
  const game = await gameRepo.findById(gameId);
  if (!game) throw new NotFoundError("Game not found");

  const gp = await gamePlayerRepo.findOne({ gameId, playerId });
  if (!gp) throw new NotFoundError("Player not in game");

  await gamePlayerRepo.destroy(gp);
  return { left: true };
}

async function endGame(gameId, playerId) {
  const game = await gameRepo.findById(gameId);
  if (!game) throw new NotFoundError("Game not found");

  if (!game.ownerId || game.ownerId !== playerId)
    throw new ForbiddenError("Only the game owner can end the game");
  if (game.status === "ended") throw new ConflictError("Game already ended");

  game.status = "ended";
  await gameRepo.save(game);
  return { ended: true };
}

async function getGameState(gameId) {
  const game = await gameRepo.findState(gameId);
  if (!game) throw new NotFoundError("Game not found");
  return { game_id: game.id, state: game.status };
}

async function getGamePlayers(gameId) {
  const game = await gameRepo.findPlayersForList(gameId);
  if (!game) throw new NotFoundError("Game not found");
  return {
    game_id: game.id,
    players: game.players.map((p) => p.username || p.name),
  };
}

async function getCurrentPlayer(gameId) {
  const game = await gameRepo.findCurrentPlayer(gameId);
  if (!game) throw new NotFoundError("Game not found");

  const name = game.currentPlayer
    ? game.currentPlayer.username || game.currentPlayer.name
    : null;
  return { game_id: game.id, current_player: name };
}

async function getTopCard(gameId) {
  const game = await gameRepo.findTopCardFields(gameId);
  if (!game) throw new NotFoundError("Game not found");

  const top =
    game.discardTopColor && game.discardTopValue
      ? `${game.discardTopColor}:${game.discardTopValue}`
      : null;

  return { game_id: game.id, top_card: top };
}

async function getGameScores(gameId) {
  const game = await gameRepo.findById(gameId, { attributes: ["id"] });
  if (!game) throw new NotFoundError("Game not found");

  const gps = await gamePlayerRepo.findAllByGameWithPlayer(gameId);
  const rows = await scoreRepo.findAllByGame(gameId);
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
