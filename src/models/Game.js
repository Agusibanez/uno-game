const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const GamePlayer = sequelize.define(
  "GamePlayer",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    gameId: { type: DataTypes.INTEGER, allowNull: false },
    playerId: { type: DataTypes.INTEGER, allowNull: false },

    isReady: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },

    turnOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },

    saidUno: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    saidUnoAt: { type: DataTypes.DATE, allowNull: true },
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
