const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Game = sequelize.define("Game", {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING(80), allowNull: false },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "waiting" },
  maxPlayers: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false }
}, {
  tableName: "games",
  timestamps: true
});

module.exports = Game;
