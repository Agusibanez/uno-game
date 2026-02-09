const service = require("../services/score.service");
const asyncHandler = require("../utils/async-handler");

const create = asyncHandler(async (req, res) => {
  res.status(201).json(await service.createScore(req.body));
});

const read = asyncHandler(async (req, res) => {
  res.json(await service.getScore(req.params.id));
});

const update = asyncHandler(async (req, res) => {
  res.json(await service.updateScore(req.params.id, req.body));
});

const remove = asyncHandler(async (req, res) => {
  await service.deleteScore(req.params.id);
  res.json({ message: "Score deleted" });
});

module.exports = { create, read, update, remove };
