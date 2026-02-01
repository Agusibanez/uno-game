const service = require("../services/game.service");

async function create(req, res, next) {
  try {
    res.status(201).json(await service.createGame(req.user.id, req.body));
  } catch (e) {
    next(e);
  }
}

async function read(req, res, next) {
  try {
    res.json(await service.getGame(req.params.id));
  } catch (e) {
    next(e);
  }
}
async function update(req, res, next) {
  try {
    res.json(await service.updateGame(req.params.id, req.body));
  } catch (e) {
    next(e);
  }
}
async function remove(req, res, next) {
  try {
    res.json(await service.deleteGame(req.params.id));
  } catch (e) {
    next(e);
  }
}

async function join(req, res, next) {
  try {
    res.json(await service.joinGame(Number(req.params.id), req.user.id));
  } catch (e) {
    next(e);
  }
}

async function ready(req, res, next) {
  try {
    res.json(await service.readyGame(Number(req.params.id), req.user.id));
  } catch (e) {
    next(e);
  }
}

async function start(req, res, next) {
  try {
    res.json(await service.startGame(Number(req.params.id), req.user.id));
  } catch (e) {
    next(e);
  }
}

async function leave(req, res, next) {
  try {
    res.json(await service.leaveGame(Number(req.params.id), req.user.id));
  } catch (e) {
    next(e);
  }
}

async function end(req, res, next) {
  try {
    res.json(await service.endGame(Number(req.params.id), req.user.id));
  } catch (e) {
    next(e);
  }
}

async function state(req, res, next) {
  try {
    res.json(await service.getGameState(Number(req.params.id)));
  } catch (e) {
    next(e);
  }
}

async function players(req, res, next) {
  try {
    res.json(await service.getGamePlayers(Number(req.params.id)));
  } catch (e) {
    next(e);
  }
}

async function currentPlayer(req, res, next) {
  try {
    res.json(await service.getCurrentPlayer(Number(req.params.id)));
  } catch (e) {
    next(e);
  }
}

async function topCard(req, res, next) {
  try {
    res.json(await service.getTopCard(Number(req.params.id)));
  } catch (e) {
    next(e);
  }
}

async function scores(req, res, next) {
  try {
    res.json(await service.getGameScores(Number(req.params.id)));
  } catch (e) {
    next(e);
  }
}

module.exports = {
  create,
  read,
  update,
  remove,
  join,
  ready,
  start,
  leave,
  end,
  state,
  players,
  currentPlayer,
  topCard,
  scores,
};
