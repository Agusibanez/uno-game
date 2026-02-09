const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  NotFoundError,
  ConflictError,
  UnauthorizedError,
} = require("../utils/domain-errors");
const { playerRepo } = require("../repositories");

async function createPlayer(payload) {
  const exists = await playerRepo.findOne({ email: payload.email });
  if (exists) throw new ConflictError("Email already exists");
  return playerRepo.create(payload);
}

async function getPlayer(id) {
  const player = await playerRepo.findByPk(id);
  if (!player) throw new NotFoundError("Player not found");
  return player;
}

async function updatePlayer(id, payload) {
  const player = await getPlayer(id);

  if (payload?.email && payload.email !== player.email) {
    const exists = await playerRepo.findOne({ email: payload.email });
    if (exists) throw new ConflictError("Email already exists");
  }

  await player.update(payload);
  return player;
}

async function deletePlayer(id) {
  const player = await getPlayer(id);
  await playerRepo.destroy(player);
  return { deleted: true };
}

async function registerUser(payload) {
  const { username, email, password } = payload;

  const existsByEmail = await playerRepo.findOne({ email });
  const existsByUsername = await playerRepo.findOne({ username });

  if (existsByEmail || existsByUsername)
    throw new ConflictError("User already exists");

  const passwordHash = await bcrypt.hash(password, 10);

  await playerRepo.create({
    name: username.trim(),
    age: 0,
    email: email.trim(),
    username: username.trim(),
    passwordHash,
  });

  return { registered: true };
}

async function loginUser(payload) {
  const { username, password } = payload;

  const user = await playerRepo.findOne({ username: username.trim() });
  if (!user || !user.passwordHash)
    throw new UnauthorizedError("Invalid credentials");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new UnauthorizedError("Invalid credentials");

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
  const user = await playerRepo.findByPk(playerId);
  if (!user) throw new NotFoundError("Player not found");

  user.tokenVersion = (user.tokenVersion || 0) + 1;
  await playerRepo.save(user);

  return { logged_out: true };
}

async function getMe(playerId) {
  const user = await playerRepo.findByPk(playerId, {
    attributes: ["id", "username", "email", "name", "age"],
  });
  if (!user) throw new NotFoundError("Player not found");
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
