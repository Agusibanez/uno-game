const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Move = sequelize.define(
  "Move",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    gameId: { type: DataTypes.INTEGER, allowNull: false },
    playerId: { type: DataTypes.INTEGER, allowNull: false },

    action: { type: DataTypes.STRING(30), allowNull: false }, 
    detail: { type: DataTypes.JSONB, allowNull: true },
  },
  { tableName: "moves", timestamps: true },
);

module.exports = Move;
