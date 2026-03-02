// src/app.js
const express = require("express");
const cardRoutes = require("./routes/card.routes");
const gameRoutes = require("./routes/game.routes");
const playerRoutes = require("./routes/player.routes");
const scoreRoutes = require("./routes/score.routes");
const statRoutes = require("./routes/stat.routes");
const errorMiddleware = require("./middlewares/error.middleware");
const morgan = require("morgan");
const trackingMiddleware = require("./middlewares/tracking.middleware");

const { memoizeMiddleware } = require("./middlewares/memoize.middleware");

const app = express();
const allowedOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", allowedOrigin);
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  return next();
});

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

app.use("/api", trackingMiddleware);
app.use("/api", cache);
app.use("/api", playerRoutes);
app.use("/api", gameRoutes);
app.use("/api", cardRoutes);
app.use("/api", scoreRoutes);
app.use("/api", statRoutes);

app.use(errorMiddleware);

module.exports = app;
