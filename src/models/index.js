const Player = require("./Player");
const Game = require("./Game");
const Card = require("./Card");
const Score = require("./Score");
const GamePlayer = require("./GamePlayer");
const Move = require("./Move");
const ApiStat = require("./ApiStat");

Player.hasMany(Game, { foreignKey: "ownerId", as: "ownedGames" });
Game.belongsTo(Player, { foreignKey: "ownerId", as: "owner" });

GamePlayer.belongsTo(Player, { foreignKey: "playerId", as: "player" });
GamePlayer.belongsTo(Game, { foreignKey: "gameId", as: "game" });

Player.hasMany(GamePlayer, { foreignKey: "playerId", as: "gamePlayers" });
Game.hasMany(GamePlayer, { foreignKey: "gameId", as: "gamePlayers" });

Game.hasMany(Card, { foreignKey: "gameId", as: "cards" });
Card.belongsTo(Game, { foreignKey: "gameId", as: "game" });

Player.hasMany(Score, { foreignKey: "playerId", as: "scores" });
Score.belongsTo(Player, { foreignKey: "playerId", as: "player" });

Game.hasMany(Score, { foreignKey: "gameId", as: "scores" });
Score.belongsTo(Game, { foreignKey: "gameId", as: "game" });

Player.hasMany(Game, { foreignKey: "currentPlayerId", as: "currentTurnGames" });
Game.belongsTo(Player, { foreignKey: "currentPlayerId", as: "currentPlayer" });

Game.hasMany(Move, { foreignKey: "gameId", as: "moves" });
Move.belongsTo(Game, { foreignKey: "gameId", as: "game" });

Player.hasMany(Move, { foreignKey: "playerId", as: "moves" });
Move.belongsTo(Player, { foreignKey: "playerId", as: "player" });

Player.hasMany(ApiStat, { foreignKey: "userId", as: "apiStats" });
ApiStat.belongsTo(Player, { foreignKey: "userId", as: "user" });

Player.belongsToMany(Game, {
  through: GamePlayer,
  foreignKey: "playerId",
  as: "games",
});

Game.belongsToMany(Player, {
  through: GamePlayer,
  foreignKey: "gameId",
  as: "players",
});

module.exports = { Player, Game, Card, Score, GamePlayer, Move, ApiStat };
