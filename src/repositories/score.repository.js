const { Score } = require("../models");

function create(data) {
  return Score.create(data);
}

function findByPk(id) {
  return Score.findByPk(id);
}

function findOne(where) {
  return Score.findOne({ where });
}

function destroy(instance) {
  return instance.destroy();
}

function destroyByGame(gameId) {
  return Score.destroy({ where: { gameId } });
}

function findAllByGame(gameId) {
  return Score.findAll({ where: { gameId } });
}

async function updateById(gameId, playerId, score) {
  const [updatedRows] = await Score.update(
    { score },
    { where: { gameId, playerId } },
  );

  if (updatedRows > 0) {
    return Score.findOne({ where: { gameId, playerId } });
  }

  return Score.create({ gameId, playerId, score });
}

module.exports = {
  create,
  findByPk,
  findOne,
  destroy,
  destroyByGame,
  findAllByGame,
  updateById,
};
