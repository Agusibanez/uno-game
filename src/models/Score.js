const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Score = sequelize.define("Score", {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  playerId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  gameId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  score: { type: DataTypes.INTEGER, allowNull: false },
  timestamp: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
  tableName: "scores",
  timestamps: false
});

module.exports = Score;
