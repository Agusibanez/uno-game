const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Card = sequelize.define("Card", {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  color: { type: DataTypes.STRING(20), allowNull: false },
  value: { type: DataTypes.STRING(20), allowNull: false },
  gameId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false }
}, {
  tableName: "cards",
  timestamps: true
});

module.exports = Card;
