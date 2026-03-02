require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const { sequelize } = require("./config/db");
require("./models");

const PORT = Number(process.env.PORT || 3000);
const allowedOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join-game", (gameId) => {
    socket.join(`game_${gameId}`);
    console.log(`Socket ${socket.id} joined game_${gameId}`);
  });

  socket.on("state-update", (data) => {
    io.to(`game_${data.gameId}`).emit("update", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

sequelize
  .authenticate()
  .then(() => sequelize.sync({ alter: true }))
  .then(() => {
    server.listen(PORT, () => {
      console.log(`API running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
    process.exit(1);
  });
