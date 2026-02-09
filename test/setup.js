require("dotenv").config({ path: ".env.test" });

const { sequelize } = require("../src/config/db");

require("../src/models");

async function resetDb() {
  await sequelize.truncate({ cascade: true, restartIdentity: true });
}

beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.sync({ force: true });
});

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await sequelize.close();
});
