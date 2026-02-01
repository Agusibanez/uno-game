const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");


const GamePlayer = sequelize.define(
  "GamePlayer",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    gameId: { type: DataTypes.INTEGER, allowNull: false },
    playerId: { type: DataTypes.INTEGER, allowNull: false },
    isReady: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
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
