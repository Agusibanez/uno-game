const { NotFoundError } = require("../utils/domain-errors");
const { cardRepo, gameRepo } = require("../repositories");

async function createCard(payload) {
  const game = await gameRepo.findById(payload.gameId);
  if (!game) throw new NotFoundError("Game not found (gameId invalid)");
  return cardRepo.create(payload);
}

async function getCard(id) {
  const card = await cardRepo.findByPk(id);
  if (!card) throw new NotFoundError("Card not found");
  return card;
}

async function updateCard(id, payload) {
  const card = await getCard(id);

  if (payload?.gameId !== undefined) {
    const game = await gameRepo.findById(payload.gameId);
    if (!game) throw new NotFoundError("Game not found (gameId invalid)");
  }

  await card.update(payload);
  return card;
}

async function deleteCard(id) {
  const card = await getCard(id);
  await cardRepo.destroy(card);
  return { deleted: true };
}

module.exports = { createCard, getCard, updateCard, deleteCard };
