const {
  ConflictError,
  NotFoundError,
  ForbiddenError,
} = require("../utils/domain-errors");
const { gameRepo, gamePlayerRepo, cardRepo } = require("../repositories");
const {
  validateDealPayload,
  assertGameStarted,
} = require("../domain/uno/validators");

async function dealCards(gameId, actorPlayerId, payload) {
  validateDealPayload(payload);

  const game = await gameRepo.findById(gameId);
  if (!game) throw new NotFoundError("Game not found");

  assertGameStarted(game);

  if (game.ownerId !== actorPlayerId) {
    throw new ForbiddenError("Only the game owner can deal cards");
  }

  const players = await gamePlayerRepo.findAllByGame(gameId);
  if (!players || players.length < 2) {
    throw new ConflictError("Not enough players to deal");
  }

  const cardsPerPlayer = payload.cardsPerPlayer;

  await dealRoundsRecursive(gameId, players, cardsPerPlayer, 0);

  const result = {};
  for (const gp of players) {
    const hand = await cardRepo.findHand(gameId, gp.playerId);
    result[`player_${gp.playerId}`] = hand.map((c) => `${c.color} ${c.value}`);
  }

  return {
    message: "Cards dealt successfully.",
    players: result,
  };
}

async function playCard(gameId, playerId, body) {
  const { cardId } = body;

  const game = await gameRepo.findById(gameId);
  if (!game) throw new NotFoundError("Game not found");

  assertGameStarted(game);
  assertPlayerTurn(game, playerId);

  const card = await cardRepo.findCardInHand(gameId, playerId, cardId);

  if (!card) {
    throw new ConflictError("Card not in your hand");
  }

  const { discardTopColor, discardTopValue } = game;

  if (!isPlayable(card, discardTopColor, discardTopValue)) {
    throw new ConflictError("Invalid card. Must match color or value.");
  }

  await cardRepo.moveToDiscard(card.id);

  await moveRepo.create({
    gameId,
    playerId,
    action: "play",
    detail: { card: `${card.color} ${card.value}` },
  });

  const remainingCards = await cardRepo.countHand(gameId, playerId);

  if (remainingCards === 0) {
    game.status = "ended";

    await calculateScores(gameId, playerId);

    await gameRepo.save(game);

    return {
      message: `Player ${playerId} has won the game!`,
    };
  }

  const newCount = await cardRepo.countHand(gameId, playerId);
  if (newCount !== 1) {
    await gamePlayerRepo.setUno(gameId, playerId, false);
  }

  game.discardTopColor = card.color;
  game.discardTopValue = card.value;

  await advanceTurn(game);

  await gameRepo.save(game);

  return {
    message: "Card played successfully.",
    nextPlayer: game.currentPlayerId,
  };
}

async function dealRoundsRecursive(gameId, players, cardsPerPlayer, round) {
  if (round >= cardsPerPlayer) return;

  await dealOneEachRecursive(gameId, players, 0);

  return dealRoundsRecursive(gameId, players, cardsPerPlayer, round + 1);
}

async function dealOneEachRecursive(gameId, players, idx) {
  if (idx >= players.length) return;

  const top = await cardRepo.findDeckTop(gameId);
  if (!top) throw new ConflictError("Deck is empty");

  await cardRepo.moveToHand(top.id, players[idx].playerId);

  return dealOneEachRecursive(gameId, players, idx + 1);
}

async function advanceTurn(game) {
  const players = await gamePlayerRepo.findAllByGame(game.id);

  const currentIndex = players.findIndex(
    (p) => p.playerId === game.currentPlayerId,
  );

  if (currentIndex === -1) {
    throw new ConflictError("Current player invalid");
  }

  const direction = 1;
  const nextIndex =
    (currentIndex + direction + players.length) % players.length;

  game.currentPlayerId = players[nextIndex].playerId;
}

async function drawCard(gameId, playerId) {
  const game = await gameRepo.findById(gameId);
  if (!game) throw new NotFoundError("Game not found");

  assertGameStarted(game);
  assertPlayerTurn(game, playerId);

  const topColor = game.discardTopColor;
  const topValue = game.discardTopValue;

  const playable = await cardRepo.findPlayableInHand(
    gameId,
    playerId,
    topColor,
    topValue,
  );

  if (playable && playable.length > 0) {
    throw new ConflictError("You have a playable card. You must play.");
  }

  const topDeck = await cardRepo.findDeckTop(gameId);
  if (!topDeck) throw new ConflictError("Deck is empty");

  await cardRepo.moveToHand(topDeck.id, playerId);

  await moveRepo.create({
    gameId,
    playerId,
    action: "draw",
    detail: { card: `${topDeck.color} ${topDeck.value}` },
  });

  await gamePlayerRepo.setUno(gameId, playerId, false);

  await advanceTurn(game);

  await gameRepo.save(game);

  return {
    message: `Player drew a card from the deck. Turn ended.`,
    cardDrawn: `${topDeck.color} ${topDeck.value}`,
    nextPlayer: game.currentPlayerId,
  };
}

async function sayUno(gameId, playerId) {
  const game = await gameRepo.findById(gameId);
  if (!game) throw new NotFoundError("Game not found");

  assertGameStarted(game);

  const gp = await gamePlayerRepo.findOne({ gameId, playerId });
  if (!gp) throw new NotFoundError("Player not in game");

  const handCount = await cardRepo.countHand(gameId, playerId);

  if (handCount !== 1) {
    throw new ConflictError(
      "You can say UNO only when you have exactly 1 card",
    );
  }

  await gamePlayerRepo.setUno(gameId, playerId, true);

  return {
    message: "UNO said successfully.",
  };
}

async function challengeUno(gameId, challengerId, challengedPlayerId) {
  const game = await gameRepo.findById(gameId);
  if (!game) throw new NotFoundError("Game not found");

  assertGameStarted(game);

  const challenged = await gamePlayerRepo.findOne({
    gameId,
    playerId: challengedPlayerId,
  });

  if (!challenged) {
    throw new NotFoundError("Challenged player not in game");
  }

  const handCount = await cardRepo.countHand(gameId, challengedPlayerId);

  if (handCount === 1 && !challenged.saidUno) {
    await drawPenaltyRecursive(gameId, challengedPlayerId, 2);

    await gamePlayerRepo.setUno(gameId, challengedPlayerId, false);

    return {
      message: `Challenge successful. Player ${challengedPlayerId} forgot to say UNO and draws 2 cards.`,
    };
  }

  return {
    message: "Challenge failed. Player said UNO on time.",
  };
}

async function drawPenaltyRecursive(gameId, playerId, remaining) {
  if (remaining <= 0) return;

  const topDeck = await cardRepo.findDeckTop(gameId);
  if (!topDeck) throw new ConflictError("Deck is empty");

  await cardRepo.moveToHand(topDeck.id, playerId);

  return drawPenaltyRecursive(gameId, playerId, remaining - 1);
}

async function calculateScores(gameId, winnerId) {
  const players = await gamePlayerRepo.findAllByGame(gameId);

  for (const p of players) {
    const hand = await cardRepo.findHand(gameId, p.playerId);

    let score = 0;

    for (const card of hand) {
      if (card.value === "skip" || card.value === "reverse") score += 20;
      else if (card.value === "draw2") score += 20;
      else if (card.value === "wild" || card.value === "wild+4") score += 50;
      else score += Number(card.value) || 0;
    }

    await scoreRepo.updateById?.(gameId, p.playerId, score);
  }
}

async function getFullStatus(gameId) {
  const game = await gameRepo.findById(gameId);
  if (!game) throw new NotFoundError("Game not found");

  const players = await gamePlayerRepo.findAllByGame(gameId);

  const hands = {};

  for (const p of players) {
    const hand = await cardRepo.findHand(gameId, p.playerId);
    hands[`player_${p.playerId}`] = hand.map((c) => `${c.color} ${c.value}`);
  }

  return {
    currentPlayer: game.currentPlayerId,
    topCard: `${game.discardTopColor} ${game.discardTopValue}`,
    hands,
  };
}

async function getMyHand(gameId, playerId) {
  const hand = await cardRepo.findHand(gameId, playerId);

  return {
    player: playerId,
    hand: hand.map((c) => `${c.color} ${c.value}`),
  };
}

module.exports = {
  dealCards,
  playCard,
  advanceTurn,
  drawCard,
  sayUno,
  challengeUno,
  calculateScores,
  getFullStatus,
  getMyHand,
};
