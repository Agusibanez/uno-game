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

module.exports = {
  create,
  findByPk,
  findOne,
  destroy,
  destroyByGame,
  findAllByGame,
};
