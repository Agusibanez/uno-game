const { Sequelize } = require("sequelize");

const isProd = process.env.NODE_ENV === "production";

function createSequelize() {
  if (process.env.DATABASE_URL) {
    return new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      logging: false,
      dialectOptions: isProd
        ? {
            ssl: { require: true, rejectUnauthorized: false },
          }
        : {},
    });
  }

  const parsedPort = Number(process.env.DB_PORT);
  const safePort = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 5432;

  return new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: safePort,
      dialect: "postgres",
      logging: false,
    },
  );
}

const sequelize = createSequelize();

module.exports = { sequelize };
