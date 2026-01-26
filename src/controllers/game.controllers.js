const service = require("../services/game.service");

async function create(req, res, next) {
  try {
    res.status(201).json(await service.createGame(req.body));
  } catch (e) {
    next(e);
  }
}
async function read(req, res, next) {
  try {
    res.json(await service.getGame(req.params.id));
  } catch (e) {
    next(e);
  }
}
async function update(req, res, next) {
  try {
    res.json(await service.updateGame(req.params.id, req.body));
  } catch (e) {
    next(e);
  }
}
async function remove(req, res, next) {
  try {
    res.json(await service.deleteGame(req.params.id));
  } catch (e) {
    next(e);
  }
}

module.exports = { create, read, update, remove };
