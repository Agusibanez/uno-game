const service = require("../services/player.service");
const asyncHandler = require("../utils/async-handler");

const create = asyncHandler(async (req, res) => {
  res.status(201).json(await service.createPlayer(req.body));
});

const read = asyncHandler(async (req, res) => {
  res.json(await service.getPlayer(req.params.id));
});

const update = asyncHandler(async (req, res) => {
  res.json(await service.updatePlayer(req.params.id, req.body));
});

const remove = asyncHandler(async (req, res) => {
  await service.deletePlayer(req.params.id);
  res.json({ message: "Player deleted" });
});

const register = asyncHandler(async (req, res) => {
  await service.registerUser(req.body);
  res.status(201).json({ message: "User registered successfully" });
});

const logout = asyncHandler(async (req, res) => {
  await service.logoutUser(req.user.id);
  res.json({ message: "User logged out successfully" });
});

const login = asyncHandler(async (req, res) => {
  res.json(await service.loginUser(req.body));
});

const me = asyncHandler(async (req, res) => {
  res.json(await service.getMe(req.user.id));
});

module.exports = { create, read, update, remove, register, login, logout, me };
