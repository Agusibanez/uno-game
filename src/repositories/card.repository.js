const { Card } = require("../models");

function create(data) {
  return Card.create(data);
}

function findByPk(id) {
  return Card.findByPk(id);
}

function bulkCreate(rows) {
  return Card.bulkCreate(rows);
}

function destroy(instance) {
  return instance.destroy();
}

function destroyByGame(gameId) {
  return Card.destroy({ where: { gameId } });
}

function findFirstByGame(gameId) {
  return Card.findOne({ where: { gameId }, order: [["id", "ASC"]] });
}

module.exports = {
  create,
  findByPk,
  bulkCreate,
  destroy,
  destroyByGame,
  findFirstByGame,
};
