const { Op } = require("sequelize");
const { Card } = require("../models");
const { find } = require("lodash");

function bulkCreate(rows) {
  return Card.bulkCreate(rows);
}

function findByPk(id) {
  return Card.findByPk(id);
}

function destroyByGame(gameId) {
  return Card.destroy({ where: { gameId } });
}

function findDeckTop(gameId) {
  return Card.findOne({
    where: { gameId, location: "deck" },
    order: [["position", "ASC"]],
  });
}

function findDiscardTop(gameId) {
  return Card.findOne({
    where: { gameId, location: "discard" },
    order: [["position", "DESC"]],
  });
}

function findHand(gameId, playerId) {
  return Card.findAll({
    where: { gameId, location: "hand", ownerPlayerId: playerId },
    order: [["id", "ASC"]],
  });
}

function countHand(gameId, playerId) {
  return Card.count({
    where: { gameId, location: "hand", ownerPlayerId: playerId },
  });
}

function findFirstByGame(gameId) {
  return findDeckTop(gameId);
}

async function moveToHand(cardId, playerId) {
  const card = await Card.findByPk(cardId);
  if (!card) return null;
  card.location = "hand";
  card.ownerPlayerId = playerId;
  await card.save();
  return card;
}

async function moveToDiscard(cardId) {
  const card = await Card.findByPk(cardId);
  if (!card) return null;
  card.location = "discard";
  card.ownerPlayerId = null;
  await card.save();
  return card;
}

async function updatePosition(cardId, position) {
  return Card.update({ position }, { where: { id: cardId } });
}

function findCardInHand(gameId, playerId, cardId) {
  return Card.findOne({
    where: { id: cardId, gameId, location: "hand", ownerPlayerId: playerId },
  });
}

function findPlayableInHand(gameId, playerId, topColor, topValue) {
  return Card.findAll({
    where: {
      gameId,
      location: "hand",
      ownerPlayerId: playerId,
      [Op.or]: [{ color: topColor }, { value: topValue }, { color: "black" }],
    },
  });
}

module.exports = {
  bulkCreate,
  findByPk,
  destroyByGame,
  findDeckTop,
  findDiscardTop,
  findHand,
  countHand,
  moveToHand,
  moveToDiscard,
  updatePosition,
  findCardInHand,
  findPlayableInHand,
  findFirstByGame,
};
