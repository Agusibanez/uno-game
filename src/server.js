require("dotenv").config();
const app = require("./app");
const { sequelize } = require("./config/db");
require("./models");

const PORT = Number(process.env.PORT || 3000);

sequelize
  .authenticate()
  .then(() => sequelize.sync({ alter: true }))
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
    process.exit(1);
  });
