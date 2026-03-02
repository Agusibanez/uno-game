const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const ApiStat = sequelize.define(
  "ApiStat",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    endpointAccess: { type: DataTypes.STRING(255), allowNull: false },
    requestMethod: { type: DataTypes.STRING(10), allowNull: false },
    statusCode: { type: DataTypes.INTEGER, allowNull: false },
    responseTime: { type: DataTypes.JSON, allowNull: false },
    requestCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    timestamp: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    userId: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: "api_stats",
    timestamps: false,
  },
);

module.exports = ApiStat;
