const express = require("express");
const playerRoutes = require("./routes/player.routes");
const gameRoutes = require("./routes/game.routes");
const cardRoutes = require("./routes/card.routes");
const scoreRoutes = require("./routes/score.routes");
const { HttpError } = require("./utils/errors");

const app = express();
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api", playerRoutes);
app.use("/api", gameRoutes);
app.use("/api", cardRoutes);
app.use("/api", scoreRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

app.use((err, req, res, next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      message: err.message,
      errors: err.errors,
    });
  }

  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

module.exports = app;
