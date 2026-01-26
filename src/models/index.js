const Player = require("./Player");
const Game = require("./Game");
const Card = require("./Card");
const Score = require("./Score");

// Relations
Game.hasMany(Card, { foreignKey: "gameId", as: "cards" });
Card.belongsTo(Game, { foreignKey: "gameId", as: "game" });

Player.hasMany(Score, { foreignKey: "playerId", as: "scores" });
Score.belongsTo(Player, { foreignKey: "playerId", as: "player" });

Game.hasMany(Score, { foreignKey: "gameId", as: "scores" });
Score.belongsTo(Game, { foreignKey: "gameId", as: "game" });

module.exports = { Player, Game, Card, Score };
