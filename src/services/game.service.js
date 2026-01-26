const { Game, Card } = require("../models");
const { HttpError } = require("../utils/errors");

function validateGameInput(data, { partial = false } = {}) {
  const errors = [];

  if (!partial || data.title !== undefined) {
    if (typeof data.title !== "string" || data.title.trim().length < 2) {
      errors.push({
        field: "title",
        message: "title must be a string (min 2 chars)",
      });
    }
  }

  if (!partial || data.status !== undefined) {
    if (typeof data.status !== "string" || data.status.trim().length < 3) {
      errors.push({ field: "status", message: "status must be a string" });
    }
  }

  if (!partial || data.maxPlayers !== undefined) {
    if (typeof data.maxPlayers !== "number" || data.maxPlayers < 2) {
      errors.push({
        field: "maxPlayers",
        message: "maxPlayers must be a number >= 2",
      });
    }
  }

  if (errors.length) throw new HttpError(400, "Validation error", errors);
}

function buildBasicDeck(gameId) {
  const colors = ["red", "blue", "green", "yellow"];
  const cards = [];

  for (const c of colors) {
    for (let n = 0; n <= 9; n++) {
      cards.push({ color: c, value: String(n), gameId });
    }
    cards.push({ color: c, value: "skip", gameId });
    cards.push({ color: c, value: "reverse", gameId });
    cards.push({ color: c, value: "+2", gameId });
  }

  cards.push({ color: "black", value: "wild", gameId });
  cards.push({ color: "black", value: "wild+4", gameId });

  return cards;
}

async function createGame(payload) {
  validateGameInput(payload);

  const created = await Game.create(payload);

  const deck = buildBasicDeck(created.id);
  await Card.bulkCreate(deck);

  return created;
}

async function getGame(id) {
  const game = await Game.findByPk(id);
  if (!game) throw new HttpError(404, "Game not found");
  return game;
}

async function updateGame(id, payload) {
  validateGameInput(payload, { partial: true });
  const game = await getGame(id);
  await game.update(payload);
  return game;
}

async function deleteGame(id) {
  const game = await getGame(id);
  await Card.destroy({ where: { gameId: id } }); 
  await game.destroy();
  return { message: "Game deleted" };
}

module.exports = { createGame, getGame, updateGame, deleteGame };
