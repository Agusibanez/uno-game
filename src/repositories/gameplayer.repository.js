const { GamePlayer, Player } = require("../models");

function create(data) {
  return GamePlayer.create(data);
}

function findOne(where) {
  return GamePlayer.findOne({ where });
}

function destroy(instance) {
  return instance.destroy();
}

function destroyByGame(gameId) {
  return GamePlayer.destroy({ where: { gameId } });
}

function findAllByGame(gameId) {
  return GamePlayer.findAll({
    where: { gameId },
    order: [["createdAt", "ASC"]],
  });
}

function findAllByGameWithPlayer(gameId) {
  return GamePlayer.findAll({
    where: { gameId },
    include: [
      { model: Player, as: "player", attributes: ["id", "username", "name"] },
    ],
  });
}

// ✅ ESTO ES LO QUE TE FALTA
function setReady(gameId, playerId, isReady) {
  return GamePlayer.update({ isReady }, { where: { gameId, playerId } });
}

module.exports = {
  create,
  findOne,
  destroy,
  destroyByGame,
  findAllByGame,
  findAllByGameWithPlayer,
  setReady,
};
