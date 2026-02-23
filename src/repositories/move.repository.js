const { Move, Player } = require("../models");

function create(data) {
  return Move.create(data);
}

function findAllByGame(gameId) {
  return Move.findAll({
    where: { gameId },
    include: [
      { model: Player, as: "player", attributes: ["id", "username", "name"] },
    ],
    order: [["createdAt", "ASC"]],
  });
}

function destroyByGame(gameId) {
  return Move.destroy({ where: { gameId } });
}

module.exports = { create, findAllByGame, destroyByGame };
