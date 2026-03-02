const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Card = sequelize.define(
  "Card",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    gameId: { type: DataTypes.INTEGER, allowNull: false },
    color: { type: DataTypes.STRING(20), allowNull: false },
    value: { type: DataTypes.STRING(20), allowNull: false },
    location: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "deck",
    },
    ownerPlayerId: { type: DataTypes.INTEGER, allowNull: true },
    position: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: "cards",
    timestamps: true,
  },
);

module.exports = Card;
