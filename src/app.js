const express = require("express");
const playerRoutes = require("./routes/player.routes");
const gameRoutes = require("./routes/game.routes");
const cardRoutes = require("./routes/card.routes");
const scoreRoutes = require("./routes/score.routes");
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api", playerRoutes);
app.use("/api", gameRoutes);
app.use("/api", cardRoutes);
app.use("/api", scoreRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

app.use(errorMiddleware);

module.exports = app;
