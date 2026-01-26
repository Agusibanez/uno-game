const service = require("../services/score.service");

async function create(req, res, next) {
  try {
    res.status(201).json(await service.createScore(req.body));
  } catch (e) {
    next(e);
  }
}
async function read(req, res, next) {
  try {
    res.json(await service.getScore(req.params.id));
  } catch (e) {
    next(e);
  }
}
async function update(req, res, next) {
  try {
    res.json(await service.updateScore(req.params.id, req.body));
  } catch (e) {
    next(e);
  }
}
async function remove(req, res, next) {
  try {
    res.json(await service.deleteScore(req.params.id));
  } catch (e) {
    next(e);
  }
}

module.exports = { create, read, update, remove };
