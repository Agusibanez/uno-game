const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env.test") });
const { sequelize } = require("../src/config/db");

require("../src/models");

async function resetDb() {
  await sequelize.truncate({ cascade: true, restartIdentity: true });
}

beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.drop({ cascade: true });
  await sequelize.sync({ force: true });
});

beforeEach(async () => {
  await sequelize.truncate({ cascade: true, restartIdentity: true });
});

afterAll(async () => {
  await sequelize.close();
});
