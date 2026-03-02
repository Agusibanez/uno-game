const {
  ConflictError,
  NotFoundError,
  ForbiddenError,
} = require("../utils/domain-errors");
const {
  gameRepo,
  gamePlayerRepo,
  cardRepo,
  moveRepo,
  scoreRepo,
} = require("../repositories");
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
  const { cardId, chosenColor } = body;

  const game = await gameRepo.findById(gameId);
  if (!game) throw new NotFoundError("Game not found");

  assertGameStarted(game);
  assertPlayerTurn(game, playerId);

  const card = await cardRepo.findCardInHand(gameId, playerId, cardId);

  if (!card) {
    throw new ConflictError("Card not in your hand");
  }

  const { discardTopColor, discardTopValue } = game;
  const hasDrawStack = (game.drawStack || 0) > 0;
  const drawPenaltyCard = isDrawPenaltyCard(card);

  if (hasDrawStack && !drawPenaltyCard) {
    throw new ConflictError(
      "You must play a +2 or wild+4 to stack, or draw penalty cards.",
    );
  }

  if (!hasDrawStack && !isPlayable(card, discardTopColor, discardTopValue)) {
    throw new ConflictError("Invalid card. Must match color or value.");
  }

  const selectedColor = normalizeChosenColor(chosenColor);
  if (card.color === "black" && !selectedColor) {
    throw new ConflictError("Wild cards require chosenColor");
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

  if (card.value === "reverse") {
    game.direction = game.direction === -1 ? 1 : -1;
  }

  game.discardTopColor = card.color === "black" ? selectedColor : card.color;
  game.discardTopValue = card.value;

  if (card.value === "+2") {
    game.drawStack = (game.drawStack || 0) + 2;
  } else if (card.value === "wild+4") {
    game.drawStack = (game.drawStack || 0) + 4;
  }

  const steps = card.value === "skip" ? 2 : 1;
  await advanceTurn(game, steps);

  await gameRepo.save(game);

  return {
    message: "Card played successfully.",
    direction: game.direction === -1 ? "counterclockwise" : "clockwise",
    drawStack: game.drawStack || 0,
    nextPlayer: game.currentPlayerId,
  };
}

function assertPlayerTurn(game, playerId) {
  if (game.currentPlayerId !== playerId) {
    throw new ForbiddenError("It is not your turn");
  }
}

function isPlayable(card, topColor, topValue) {
  if (!card) return false;
  if (card.color === "black") return true;
  return card.color === topColor || card.value === topValue;
}

function isDrawPenaltyCard(card) {
  return card?.value === "+2" || card?.value === "wild+4";
}

function normalizeChosenColor(chosenColor) {
  if (typeof chosenColor !== "string") return null;
  const color = chosenColor.trim().toLowerCase();
  return ["red", "blue", "green", "yellow"].includes(color) ? color : null;
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

async function advanceTurn(game, steps = 1) {
  const players = await gamePlayerRepo.findAllByGame(game.id);

  const currentIndex = players.findIndex(
    (p) => p.playerId === game.currentPlayerId,
  );

  if (currentIndex === -1) {
    throw new ConflictError("Current player invalid");
  }

  const direction = game.direction === -1 ? -1 : 1;
  const normalizedSteps =
    Number.isInteger(steps) && steps > 0 ? steps : 1;

  const nextIndex =
    (currentIndex + direction * normalizedSteps + players.length) %
    players.length;

  game.currentPlayerId = players[nextIndex].playerId;
}

async function drawCard(gameId, playerId) {
  const game = await gameRepo.findById(gameId);
  if (!game) throw new NotFoundError("Game not found");

  assertGameStarted(game);
  assertPlayerTurn(game, playerId);

  if ((game.drawStack || 0) > 0) {
    const penaltyCount = game.drawStack;
    const drawnCards = await drawFixedCountRecursive(
      gameId,
      playerId,
      penaltyCount,
      [],
    );

    game.drawStack = 0;

    await moveRepo.create({
      gameId,
      playerId,
      action: "draw",
      detail: {
        cards: drawnCards,
        playable: false,
        penalty: true,
      },
    });

    await gamePlayerRepo.setUno(gameId, playerId, false);
    await advanceTurn(game);
    await gameRepo.save(game);

    return {
      message: `Player drew ${drawnCards.length} penalty card(s). Turn ended.`,
      cardsDrawn: drawnCards,
      drawnCard: drawnCards.length > 0 ? drawnCards[drawnCards.length - 1] : null,
      playable: false,
      drawStack: game.drawStack,
      nextPlayer: game.currentPlayerId,
    };
  }

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

  const drawResult = await drawUntilPlayableRecursive(
    gameId,
    playerId,
    topColor,
    topValue,
    [],
  );

  await moveRepo.create({
    gameId,
    playerId,
    action: "draw",
    detail: {
      cards: drawResult.drawnCards,
      playable: drawResult.playable,
    },
  });

  await gamePlayerRepo.setUno(gameId, playerId, false);

  await advanceTurn(game);

  await gameRepo.save(game);

  return {
    message: `Player drew a card from the deck. Turn ended.`,
    cardsDrawn: drawResult.drawnCards,
    drawnCard:
      drawResult.drawnCards.length > 0
        ? drawResult.drawnCards[drawResult.drawnCards.length - 1]
        : null,
    playable: drawResult.playable,
    nextPlayer: game.currentPlayerId,
  };
}

async function drawFixedCountRecursive(gameId, playerId, remaining, acc) {
  if (remaining <= 0) return acc;

  const topDeck = await cardRepo.findDeckTop(gameId);
  if (!topDeck) throw new ConflictError("Deck is empty");

  await cardRepo.moveToHand(topDeck.id, playerId);
  const nextAcc = [...acc, `${topDeck.color} ${topDeck.value}`];
  return drawFixedCountRecursive(gameId, playerId, remaining - 1, nextAcc);
}

async function drawUntilPlayableRecursive(
  gameId,
  playerId,
  topColor,
  topValue,
  acc,
) {
  const topDeck = await cardRepo.findDeckTop(gameId);

  if (!topDeck) {
    return { drawnCards: acc, playable: false };
  }

  await cardRepo.moveToHand(topDeck.id, playerId);
  const label = `${topDeck.color} ${topDeck.value}`;
  const nextAcc = [...acc, label];

  if (isPlayable(topDeck, topColor, topValue)) {
    return { drawnCards: nextAcc, playable: true };
  }

  return drawUntilPlayableRecursive(
    gameId,
    playerId,
    topColor,
    topValue,
    nextAcc,
  );
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
      else if (card.value === "draw2" || card.value === "+2") score += 20;
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
    hand: hand.map((c) => ({
      id: c.id,
      color: c.color,
      value: c.value,
      label: `${c.color} ${c.value}`,
    })),
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
