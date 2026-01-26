const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Player = sequelize.define(
  "Player",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING(50), allowNull: false },
    age: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    email: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  },
  {
    tableName: "players",
    timestamps: true,
  },
);

module.exports = Player;
