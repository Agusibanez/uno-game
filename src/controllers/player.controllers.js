const service = require("../services/player.service");

async function create(req, res, next) {
  try {
    res.status(201).json(await service.createPlayer(req.body));
  } catch (e) {
    next(e);
  }
}
async function read(req, res, next) {
  try {
    res.json(await service.getPlayer(req.params.id));
  } catch (e) {
    next(e);
  }
}
async function update(req, res, next) {
  try {
    res.json(await service.updatePlayer(req.params.id, req.body));
  } catch (e) {
    next(e);
  }
}
async function remove(req, res, next) {
  try {
    res.json(await service.deletePlayer(req.params.id));
  } catch (e) {
    next(e);
  }
}

module.exports = { create, read, update, remove };
