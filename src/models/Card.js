const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Card = sequelize.define(
  "Card",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    gameId: { type: DataTypes.INTEGER, allowNull: false },
    color: { type: DataTypes.STRING(20), allowNull: false },
    value: { type: DataTypes.STRING(20), allowNull: false },
    location: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "deck" },
    ownerPlayerId: { type: DataTypes.INTEGER, allowNull: true },
    position: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: "cards",
    timestamps: true,
  },
);

    username: { type: DataTypes.STRING(50), allowNull: true, unique: true },
    passwordHash: { type: DataTypes.STRING(255), allowNull: true },
    tokenVersion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "players",
    timestamps: true,
  },
);

module.exports = Player;
