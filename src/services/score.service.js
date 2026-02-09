const { NotFoundError } = require("../utils/domain-errors");
const { scoreRepo, playerRepo, gameRepo } = require("../repositories");

async function createScore(payload) {
  const player = await playerRepo.findByPk(payload.playerId);
  if (!player) throw new NotFoundError("Player not found (playerId invalid)");

  const game = await gameRepo.findById(payload.gameId);
  if (!game) throw new NotFoundError("Game not found (gameId invalid)");

  return scoreRepo.create(payload);
}

async function getScore(id) {
  const score = await scoreRepo.findByPk(id);
  if (!score) throw new NotFoundError("Score not found");
  return score;
}

async function updateScore(id, payload) {
  const score = await getScore(id);

  if (payload?.playerId !== undefined) {
    const player = await playerRepo.findByPk(payload.playerId);
    if (!player) throw new NotFoundError("Player not found (playerId invalid)");
  }

  if (payload?.gameId !== undefined) {
    const game = await gameRepo.findById(payload.gameId);
    if (!game) throw new NotFoundError("Game not found (gameId invalid)");
  }

  await score.update(payload);
  return score;
}

async function deleteScore(id) {
  const score = await getScore(id);
  await scoreRepo.destroy(score);
  return { deleted: true };
}

module.exports = { createScore, getScore, updateScore, deleteScore };
