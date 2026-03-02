// src/app.js
const express = require("express");
const cardRoutes = require("./routes/card.routes");
const gameRoutes = require("./routes/game.routes");
const playerRoutes = require("./routes/player.routes");
const scoreRoutes = require("./routes/score.routes");
const errorMiddleware = require("./middlewares/error.middleware");
const morgan = require("morgan");

const { memoizeMiddleware } = require("./middlewares/memoize.middleware");

const { memoizeMiddleware } = require("./middlewares/memoize.middleware");

const app = express();
app.use(express.json());
app.use(morgan("dev"));

const cache = memoizeMiddleware({
  max: 50,
  maxAge: 30000,
  methods: ["GET"],
  exclude: (req) => {
    if (req.originalUrl.startsWith("/api/auth")) return true;
    if (req.originalUrl.includes("/me")) return true;
    return false;
  },
});

app.use("/api", cache);
app.use("/api", playerRoutes);
app.use("/api", gameRoutes);
app.use("/api", cardRoutes);
app.use("/api", scoreRoutes);

app.use(errorMiddleware);

module.exports = app;
