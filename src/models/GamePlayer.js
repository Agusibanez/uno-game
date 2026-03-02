const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const GamePlayer = sequelize.define(
  "GamePlayer",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    gameId: { type: DataTypes.INTEGER, allowNull: false },
    playerId: { type: DataTypes.INTEGER, allowNull: false },
    isReady: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    turnOrder: { type: DataTypes.INTEGER, allowNull: true },
    saidUno: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    saidUnoAt: { type: DataTypes.DATE, allowNull: true },
    direction: { type: DataTypes.STRING, allowNull: true },
    drawStack: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    ownerId: { type: DataTypes.INTEGER, allowNull: true },
    currentPlayerId: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: "game_players",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["gameId", "playerId"], // evita duplicados
      },
    ],
  },
);

module.exports = GamePlayer;
