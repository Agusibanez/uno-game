const { ApiStat } = require("../models");

function create(data) {
  return ApiStat.create(data);
}

function findAll() {
  return ApiStat.findAll({ order: [["timestamp", "DESC"]] });
}

module.exports = { create, findAll };
