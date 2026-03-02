const service = require("../services/player.service");
const asyncHandler = require("../utils/async-handler");
const { requireParamInt, requireAuthUserId } = require("../utils/http-params");

const create = asyncHandler(async (req, res) => {
  res.status(201).json(await service.createPlayer(req.body));
});

const read = asyncHandler(async (req, res) => {
  const id = requireParamInt(req, res, "id");
  if (id === null) return;

  res.json(await service.getPlayer(id));
});

const update = asyncHandler(async (req, res) => {
  const id = requireParamInt(req, res, "id");
  if (id === null) return;

  res.json(await service.updatePlayer(id, req.body));
});

const remove = asyncHandler(async (req, res) => {
  const id = requireParamInt(req, res, "id");
  if (id === null) return;

  await service.deletePlayer(id);
  res.json({ message: "Player deleted" });
});

const register = asyncHandler(async (req, res) => {
  await service.registerUser(req.body);
  res.status(201).json({ message: "User registered successfully" });
});

const logout = asyncHandler(async (req, res) => {
  const userId = requireAuthUserId(req, res);
  if (userId === null) return;

  await service.logoutUser(userId);
  res.json({ message: "User logged out successfully" });
});

const login = asyncHandler(async (req, res) => {
  res.json(await service.loginUser(req.body));
});

const me = asyncHandler(async (req, res) => {
  const userId = requireAuthUserId(req, res);
  if (userId === null) return;

  res.json(await service.getMe(userId));
});

module.exports = { create, read, update, remove, register, login, logout, me };
