const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Game = sequelize.define(
  "Game",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING(80), allowNull: false },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "waiting",
    },
    ownerId: { type: DataTypes.INTEGER, allowNull: true },
    maxPlayers: { type: DataTypes.INTEGER, allowNull: false },
    currentPlayerId: { type: DataTypes.INTEGER, allowNull: true },
    discardTopColor: { type: DataTypes.STRING(20), allowNull: true },
    discardTopValue: { type: DataTypes.STRING(20), allowNull: true },
  },
  {
    tableName: "games",
    timestamps: true,
  },
);

module.exports = Game;
