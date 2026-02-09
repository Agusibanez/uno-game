const service = require("../services/card.service");
const asyncHandler = require("../utils/async-handler");

const create = asyncHandler(async (req, res) => {
  res.status(201).json(await service.createCard(req.body));
});

const read = asyncHandler(async (req, res) => {
  res.json(await service.getCard(req.params.id));
});

const update = asyncHandler(async (req, res) => {
  res.json(await service.updateCard(req.params.id, req.body));
});

const remove = asyncHandler(async (req, res) => {
  await service.deleteCard(req.params.id);
  res.json({ message: "Card deleted" });
});

module.exports = { create, read, update, remove };
