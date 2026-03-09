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
    order: [["turnOrder", "ASC"]],
  });
}

function findAllByGameWithPlayer(gameId) {
  return GamePlayer.findAll({
    where: { gameId },
    include: [{ model: Player, as: "player", attributes: ["id", "username", "name"] }],
    order: [["turnOrder", "ASC"]],
  });
}

async function setReady(gameId, playerId, isReady) {
  await GamePlayer.update({ isReady }, { where: { gameId, playerId } });
  return GamePlayer.findOne({ where: { gameId, playerId } });
}

async function setUno(gameId, playerId, saidUno) {
  await GamePlayer.update(
    { saidUno, saidUnoAt: saidUno ? new Date() : null },
    { where: { gameId, playerId } },
  );
  return GamePlayer.findOne({ where: { gameId, playerId } });
}

async function resetForRematch(gameId) {
  await GamePlayer.update(
    { isReady: false, saidUno: false, saidUnoAt: null },
    { where: { gameId } },
  );
  return findAllByGame(gameId);
}

module.exports = {
  create,
  findOne,
  destroy,
  destroyByGame,
  findAllByGame,
  findAllByGameWithPlayer,
  setReady,
  setUno,
  resetForRematch,
};
