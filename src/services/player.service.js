const { Player } = require("../models");
const { HttpError } = require("../utils/errors");
const bcrypt = require("bcryptjs");

function validatePlayerInput(data, { partial = false } = {}) {
  if (!data || typeof data !== "object") {
    throw new HttpError(400, "Validation error", [
      { field: "body", message: "request body must be a JSON object" },
    ]);
  }

  const errors = [];

  if (!partial || data.name !== undefined) {
    if (typeof data.name !== "string" || data.name.trim().length < 2) {
      errors.push({
        field: "name",
        message: "name must be a string (min 2 chars)",
      });
    }
  }

  if (!partial || data.age !== undefined) {
    if (typeof data.age !== "number" || data.age < 0) {
      errors.push({ field: "age", message: "age must be a number >= 0" });
    }
  }

  if (!partial || data.email !== undefined) {
    const emailOk =
      typeof data.email === "string" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
    if (!emailOk)
      errors.push({ field: "email", message: "email format is invalid" });
  }

  if (errors.length) throw new HttpError(400, "Validation error", errors);
}

async function createPlayer(payload) {
  validatePlayerInput(payload);

  const exists = await Player.findOne({ where: { email: payload.email } });
  if (exists) throw new HttpError(409, "Email already exists");

  const created = await Player.create(payload);
  return created;
}

async function getPlayer(id) {
  const player = await Player.findByPk(id);
  if (!player) throw new HttpError(404, "Player not found");
  return player;
}

async function updatePlayer(id, payload) {
  validatePlayerInput(payload, { partial: true });

  const player = await getPlayer(id);

  if (payload.email && payload.email !== player.email) {
    const exists = await Player.findOne({ where: { email: payload.email } });
    if (exists) throw new HttpError(409, "Email already exists");
  }

  await player.update(payload);
  return player;
}

async function deletePlayer(id) {
  const player = await getPlayer(id);
  await player.destroy();
  return { message: "Player deleted" };
}

async function registerUser(payload) {
  if (!payload || typeof payload !== "object") {
    throw new HttpError(400, "Validation error", [
      { field: "body", message: "request body must be a JSON object" },
    ]);
  }

  const { username, email, password } = payload;

  const errors = [];
  if (typeof username !== "string" || username.trim().length < 2) {
    errors.push({ field: "username", message: "username must be min 2 chars" });
  }

  const emailOk =
    typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk)
    errors.push({ field: "email", message: "email format is invalid" });

  if (typeof password !== "string" || password.length < 6) {
    errors.push({ field: "password", message: "password must be min 6 chars" });
  }

  if (errors.length) throw new HttpError(400, "Validation error", errors);

  const existsByEmail = await Player.findOne({ where: { email } });
  const existsByUsername = await Player.findOne({ where: { username } });

  if (existsByEmail || existsByUsername) {
    throw new HttpError(409, "User already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await Player.create({
    name: username.trim(),
    age: 0,
    email: email.trim(),
    username: username.trim(),
    passwordHash,
  });

  return { message: "User registered successfully" };
}

const jwt = require("jsonwebtoken");

async function loginUser(payload) {
  if (!payload || typeof payload !== "object") {
    throw new HttpError(400, "Validation error", [
      { field: "body", message: "request body must be a JSON object" },
    ]);
  }

  const { username, password } = payload;

  if (typeof username !== "string" || username.trim().length < 2) {
    throw new HttpError(400, "Validation error", [
      { field: "username", message: "username must be min 2 chars" },
    ]);
  }

  if (typeof password !== "string" || password.length < 6) {
    throw new HttpError(400, "Validation error", [
      { field: "password", message: "password must be min 6 chars" },
    ]);
  }

  const user = await Player.findOne({ where: { username: username.trim() } });
  if (!user || !user.passwordHash) {
    throw new HttpError(401, "Invalid credentials");
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new HttpError(401, "Invalid credentials");
  }

  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      tokenVersion: user.tokenVersion || 0,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" },
  );

  return { access_token: token };
}

async function logoutUser(playerId) {
  const user = await Player.findByPk(playerId);
  if (!user) throw new HttpError(404, "Player not found");

  user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save();

  return { message: "User logged out successfully" };
}

async function getMe(playerId) {
  const user = await Player.findByPk(playerId, {
    attributes: ["id", "username", "email", "name", "age"],
  });

  if (!user) throw new HttpError(404, "Player not found");
  return user;
}

module.exports = {
  createPlayer,
  getPlayer,
  updatePlayer,
  deletePlayer,
  registerUser,
  loginUser,
  logoutUser,
  getMe,
};
