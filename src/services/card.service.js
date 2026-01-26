const { Card, Game } = require("../models");
const { HttpError } = require("../utils/errors");

function validateCardInput(data, { partial = false } = {}) {
  const errors = [];

  if (!partial || data.color !== undefined) {
    if (typeof data.color !== "string" || data.color.trim().length < 3) {
      errors.push({ field: "color", message: "color must be a string" });
    }
  }

  if (!partial || data.value !== undefined) {
    if (typeof data.value !== "string" || data.value.trim().length < 1) {
      errors.push({ field: "value", message: "value must be a string" });
    }
  }

  if (!partial || data.gameId !== undefined) {
    if (!data.gameId || Number.isNaN(Number(data.gameId))) {
      errors.push({
        field: "gameId",
        message: "gameId is required and must be numeric",
      });
    }
  }

  if (errors.length) throw new HttpError(400, "Validation error", errors);
}

async function createCard(payload) {
  validateCardInput(payload);

  const game = await Game.findByPk(payload.gameId);
  if (!game) throw new HttpError(404, "Game not found (gameId invalid)");

  return await Card.create(payload);
}

async function getCard(id) {
  const card = await Card.findByPk(id);
  if (!card) throw new HttpError(404, "Card not found");
  return card;
}

async function updateCard(id, payload) {
  validateCardInput(payload, { partial: true });

  const card = await getCard(id);

  if (payload.gameId) {
    const game = await Game.findByPk(payload.gameId);
    if (!game) throw new HttpError(404, "Game not found (gameId invalid)");
  }

  await card.update(payload);
  return card;
}

async function deleteCard(id) {
  const card = await getCard(id);
  await card.destroy();
  return { message: "Card deleted" };
}

module.exports = { createCard, getCard, updateCard, deleteCard };
