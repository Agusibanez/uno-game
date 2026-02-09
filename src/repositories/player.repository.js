const { Player } = require("../models");

function create(data) {
  return Player.create(data);
}

function findByPk(id, options = {}) {
  return Player.findByPk(id, options);
}

function findOne(where) {
  return Player.findOne({ where });
}

function destroy(instance) {
  return instance.destroy();
}

function save(instance) {
  return instance.save();
}

module.exports = { create, findByPk, findOne, destroy, save };
