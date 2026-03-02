const service = require("../services/card.service");
const asyncHandler = require("../utils/async-handler");
const { requireParamInt } = require("../utils/http-params");

const create = asyncHandler(async (req, res) => {
  res.status(201).json(await service.createCard(req.body));
});

const read = asyncHandler(async (req, res) => {
  const id = requireParamInt(req, res, "id");
  if (id === null) return;

  res.json(await service.getCard(id));
});

const update = asyncHandler(async (req, res) => {
  const id = requireParamInt(req, res, "id");
  if (id === null) return;

  res.json(await service.updateCard(id, req.body));
});

const remove = asyncHandler(async (req, res) => {
  const id = requireParamInt(req, res, "id");
  if (id === null) return;

  await service.deleteCard(id);
  res.json({ message: "Card deleted" });
});

module.exports = { create, read, update, remove };
