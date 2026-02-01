const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Player = sequelize.define(
  "Player",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING(50), allowNull: false },
    age: { type: DataTypes.INTEGER, allowNull: false },
    email: { type: DataTypes.STRING(120), allowNull: false, unique: true },

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
