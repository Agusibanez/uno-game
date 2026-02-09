const { Game, Player } = require("../models");

function create(data) {
  return Game.create(data);
}

function findById(id, options = {}) {
  return Game.findByPk(id, options);
}

function findByIdWithPlayers(id) {
  return Game.findByPk(id, { include: [{ model: Player, as: "players" }] });
}

function destroy(gameInstance) {
  return gameInstance.destroy();
}

function save(gameInstance) {
  return gameInstance.save();
}

function findState(id) {
  return Game.findByPk(id, { attributes: ["id", "status"] });
}

function findPlayersForList(id) {
  return Game.findByPk(id, {
    include: [
      { model: Player, as: "players", attributes: ["username", "name"] },
    ],
  });
}

function findCurrentPlayer(id) {
  return Game.findByPk(id, {
    attributes: ["id", "currentPlayerId"],
    include: [
      { model: Player, as: "currentPlayer", attributes: ["username", "name"] },
    ],
  });
}

function findTopCardFields(id) {
  return Game.findByPk(id, {
    attributes: ["id", "discardTopColor", "discardTopValue"],
  });
}

function updateById(id, payload) {
  return Game.update(payload, { where: { id } });
}

module.exports = {
  create,
  findById,
  findByIdWithPlayers,
  destroy,
  save,
  findState,
  findPlayersForList,
  findCurrentPlayer,
  findTopCardFields,
  updateById,
};
