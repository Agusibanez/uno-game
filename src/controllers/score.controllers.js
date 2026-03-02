const service = require("../services/score.service");
const asyncHandler = require("../utils/async-handler");
const { requireParamInt } = require("../utils/http-params");

const create = asyncHandler(async (req, res) => {
  res.status(201).json(await service.createScore(req.body));
});

const read = asyncHandler(async (req, res) => {
  const id = requireParamInt(req, res, "id");
  if (id === null) return;

  res.json(await service.getScore(id));
});

const update = asyncHandler(async (req, res) => {
  const id = requireParamInt(req, res, "id");
  if (id === null) return;

  res.json(await service.updateScore(id, req.body));
});

const remove = asyncHandler(async (req, res) => {
  const id = requireParamInt(req, res, "id");
  if (id === null) return;

  await service.deleteScore(id);
  res.json({ message: "Score deleted" });
});

module.exports = { create, read, update, remove };
