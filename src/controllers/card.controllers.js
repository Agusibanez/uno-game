const service = require("../services/card.service");

async function create(req, res, next) {
  try {
    res.status(201).json(await service.createCard(req.body));
  } catch (e) {
    next(e);
  }
}
async function read(req, res, next) {
  try {
    res.json(await service.getCard(req.params.id));
  } catch (e) {
    next(e);
  }
}
async function update(req, res, next) {
  try {
    res.json(await service.updateCard(req.params.id, req.body));
  } catch (e) {
    next(e);
  }
}
async function remove(req, res, next) {
  try {
    res.json(await service.deleteCard(req.params.id));
  } catch (e) {
    next(e);
  }
}

module.exports = { create, read, update, remove };
