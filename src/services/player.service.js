const { Player } = require("../models");
const { HttpError } = require("../utils/errors");

function validatePlayerInput(data, { partial = false } = {}) {
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

module.exports = { createPlayer, getPlayer, updatePlayer, deletePlayer };
