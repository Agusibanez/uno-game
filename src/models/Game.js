const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const GamePlayer = sequelize.define(
  "GamePlayer",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING(120), allowNull: false },
    maxPlayers: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 4 },
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "waiting" },
    ownerId: { type: DataTypes.INTEGER, allowNull: false },
    currentPlayerId: { type: DataTypes.INTEGER, allowNull: true },
    discardTopColor: { type: DataTypes.STRING(20), allowNull: true },
    discardTopValue: { type: DataTypes.STRING(20), allowNull: true },
    direction: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    drawStack: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  {
    tableName: "game_players",
    timestamps: true,
    indexes: [{ unique: true, fields: ["gameId", "playerId"] }],
  },
);

module.exports = GamePlayer;
