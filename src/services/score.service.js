const { Score, Player, Game } = require("../models");
const { HttpError } = require("../utils/errors");

function validateScoreInput(data, { partial = false } = {}) {
  const errors = [];

  if (!partial || data.playerId !== undefined) {
    if (!data.playerId || Number.isNaN(Number(data.playerId))) {
      errors.push({
        field: "playerId",
        message: "playerId is required and must be numeric",
      });
    }
  }

  if (!partial || data.gameId !== undefined) {
    if (!data.gameId || Number.isNaN(Number(data.gameId))) {
      errors.push({
        field: "gameId",
        message: "gameId is required and must be numeric",
      });
    }
  }

  if (!partial || data.score !== undefined) {
    if (typeof data.score !== "number") {
      errors.push({ field: "score", message: "score must be a number" });
    }
  }

  if (errors.length) throw new HttpError(400, "Validation error", errors);
}

async function createScore(payload) {
  validateScoreInput(payload);

  const player = await Player.findByPk(payload.playerId);
  if (!player) throw new HttpError(404, "Player not found (playerId invalid)");

  const game = await Game.findByPk(payload.gameId);
  if (!game) throw new HttpError(404, "Game not found (gameId invalid)");

  return await Score.create(payload);
}

async function getScore(id) {
  const score = await Score.findByPk(id);
  if (!score) throw new HttpError(404, "Score not found");
  return score;
}

async function updateScore(id, payload) {
  validateScoreInput(payload, { partial: true });

  const score = await getScore(id);

  if (payload.playerId) {
    const player = await Player.findByPk(payload.playerId);
    if (!player)
      throw new HttpError(404, "Player not found (playerId invalid)");
  }
  if (payload.gameId) {
    const game = await Game.findByPk(payload.gameId);
    if (!game) throw new HttpError(404, "Game not found (gameId invalid)");
  }

  await score.update(payload);
  return score;
}

async function deleteScore(id) {
  const score = await getScore(id);
  await score.destroy();
  return { message: "Score deleted" };
}

module.exports = { createScore, getScore, updateScore, deleteScore };
