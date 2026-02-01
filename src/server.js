require("dotenv").config();
const app = require("./app");
const { sequelize } = require("./config/db");
require("./models");

const PORT = Number(process.env.PORT || 3000);

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    app.listen(PORT, () =>
      console.log(`API running on http://localhost:${PORT}`),
    );
  } catch (err) {
    console.error("DB connection failed:", err);
    process.exit(1);
  }
})();
