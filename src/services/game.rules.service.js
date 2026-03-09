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
  if (!game) throw new NotFoundError("Partida no encontrada");

  assertGameStarted(game);

  if (game.ownerId !== actorPlayerId) {
    throw new ForbiddenError("Solo el owner de la partida puede repartir cartas");
  }

  const players = await gamePlayerRepo.findAllByGame(gameId);
  if (!players || players.length < 2) {
    throw new ConflictError("No hay suficientes jugadores para repartir");
  }

  const handCounts = await Promise.all(
    players.map((p) => cardRepo.countHand(gameId, p.playerId)),
  );
  const alreadyDealt = handCounts.some((count) => count > 0);
  if (alreadyDealt) {
    throw new ConflictError("Las cartas ya fueron repartidas en esta partida");
  }

  const cardsPerPlayer = payload.cardsPerPlayer;

  await dealRoundsRecursive(gameId, players, cardsPerPlayer, 0);

  const result = {};
  for (const gp of players) {
    const hand = await cardRepo.findHand(gameId, gp.playerId);
    result[`player_${gp.playerId}`] = hand.map((c) => `${c.color} ${c.value}`);
  }

  return {
    message: "Cartas repartidas correctamente.",
    players: result,
  };
}

async function playCard(gameId, playerId, body) {
  const { cardId, chosenColor } = body;

  const game = await gameRepo.findById(gameId);
  if (!game) throw new NotFoundError("Partida no encontrada");

  assertGameStarted(game);
  assertPlayerTurn(game, playerId);

  const card = await cardRepo.findCardInHand(gameId, playerId, cardId);

  if (!card) {
    throw new ConflictError("Esa carta no esta en tu mano");
  }

  const { discardTopColor, discardTopValue } = game;
  const hasDrawStack = (game.drawStack || 0) > 0;
  const drawPenaltyCard = isDrawPenaltyCard(card);
  const topIsPenaltyCard =
    game.discardTopValue === "+2" || game.discardTopValue === "wild+4";

  if (hasDrawStack && !drawPenaltyCard) {
    throw new ConflictError(
      "Debes jugar un +2 o wild+4 para apilar, o robar las cartas de penalizacion.",
    );
  }

  if (!hasDrawStack && !isPlayable(card, discardTopColor, discardTopValue)) {
    throw new ConflictError("Carta invalida. Debe coincidir color o valor.");
  }

  const selectedColor = normalizeChosenColor(chosenColor);
  if (card.color === "black" && !selectedColor) {
    throw new ConflictError("Las cartas wild requieren chosenColor");
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

    const playersWithInfo = await gamePlayerRepo.findAllByGameWithPlayer?.(gameId);
    const winnerInfo = playersWithInfo?.find((p) => p.playerId === playerId);
    const winnerName =
      winnerInfo?.player?.username || winnerInfo?.player?.name || `Jugador ${playerId}`;

    await gameRepo.save(game);

    return {
      message: `${winnerName} gano la partida!`,
      winnerName,
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
    game.drawStack = hasDrawStack && topIsPenaltyCard ? game.drawStack + 2 : 2;
  } else if (card.value === "wild+4") {
    game.drawStack = hasDrawStack && topIsPenaltyCard ? game.drawStack + 4 : 4;
  }

  const steps = card.value === "skip" ? 2 : 1;
  await advanceTurn(game, steps);

  await gameRepo.save(game);

  return {
    message: "Carta jugada correctamente.",
    direction: game.direction === -1 ? "antihorario" : "horario",
    drawStack: game.drawStack || 0,
    nextPlayer: game.currentPlayerId,
  };
}

function assertPlayerTurn(game, playerId) {
  if (game.currentPlayerId !== playerId) {
    throw new ForbiddenError("No es tu turno");
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
  if (!top) throw new ConflictError("El mazo esta vacio");

  await cardRepo.moveToHand(top.id, players[idx].playerId);

  return dealOneEachRecursive(gameId, players, idx + 1);
}

async function advanceTurn(game, steps = 1) {
  const players = await gamePlayerRepo.findAllByGame(game.id);

  const currentIndex = players.findIndex(
    (p) => p.playerId === game.currentPlayerId,
  );

  if (currentIndex === -1) {
    throw new ConflictError("Jugador actual invalido");
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
  if (!game) throw new NotFoundError("Partida no encontrada");

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
      message: `Robaste ${drawnCards.length} carta(s) de penalizacion. Turno finalizado.`,
      cardsDrawn: drawnCards,
      drawnCard: drawnCards.length > 0 ? drawnCards[drawnCards.length - 1] : null,
      playable: false,
      drawStack: game.drawStack,
      nextPlayer: game.currentPlayerId,
    };
  }

  const topColor = game.discardTopColor;
  const topValue = game.discardTopValue;

  const drawResult = await drawSingleCard(gameId, playerId, topColor, topValue);

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
    message: "Robaste una carta del mazo. Turno finalizado.",
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
  if (!topDeck) throw new ConflictError("El mazo esta vacio");

  await cardRepo.moveToHand(topDeck.id, playerId);
  const nextAcc = [...acc, `${topDeck.color} ${topDeck.value}`];
  return drawFixedCountRecursive(gameId, playerId, remaining - 1, nextAcc);
}

async function drawSingleCard(
  gameId,
  playerId,
  topColor,
  topValue,
) {
  const topDeck = await cardRepo.findDeckTop(gameId);

  if (!topDeck) {
    throw new ConflictError("El mazo esta vacio");
  }

  await cardRepo.moveToHand(topDeck.id, playerId);
  const label = `${topDeck.color} ${topDeck.value}`;
  return {
    drawnCards: [label],
    playable: isPlayable(topDeck, topColor, topValue),
  };
}

async function sayUno(gameId, playerId) {
  const game = await gameRepo.findById(gameId);
  if (!game) throw new NotFoundError("Partida no encontrada");

  assertGameStarted(game);

  const gp = await gamePlayerRepo.findOne({ gameId, playerId });
  if (!gp) throw new NotFoundError("Jugador no esta en la partida");

  const handCount = await cardRepo.countHand(gameId, playerId);

  if (handCount !== 1) {
    throw new ConflictError(
      "Solo puedes decir UNO cuando tienes exactamente 1 carta",
    );
  }

  await gamePlayerRepo.setUno(gameId, playerId, true);

  return {
    message: "Cantaste UNO correctamente.",
  };
}

async function challengeUno(gameId, challengerId, challengedPlayerId) {
  const game = await gameRepo.findById(gameId);
  if (!game) throw new NotFoundError("Partida no encontrada");

  assertGameStarted(game);

  const challenged = await gamePlayerRepo.findOne({
    gameId,
    playerId: challengedPlayerId,
  });

  if (!challenged) {
    throw new NotFoundError("El jugador desafiado no esta en la partida");
  }

  const handCount = await cardRepo.countHand(gameId, challengedPlayerId);

  if (handCount === 1 && !challenged.saidUno) {
    await drawPenaltyRecursive(gameId, challengedPlayerId, 2);

    await gamePlayerRepo.setUno(gameId, challengedPlayerId, false);

    return {
      message: `Desafio exitoso. El jugador ${challengedPlayerId} olvido decir UNO y roba 2 cartas.`,
    };
  }

  return {
    message: "Desafio fallido. El jugador dijo UNO a tiempo.",
  };
}

async function drawPenaltyRecursive(gameId, playerId, remaining) {
  if (remaining <= 0) return;

  const topDeck = await cardRepo.findDeckTop(gameId);
  if (!topDeck) throw new ConflictError("El mazo esta vacio");

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
  if (!game) throw new NotFoundError("Partida no encontrada");

  const players = await gamePlayerRepo.findAllByGame(gameId);
  const playersWithInfo =
    (await gamePlayerRepo.findAllByGameWithPlayer?.(gameId)) || [];

  const hands = {};
  const participants = [];

  for (const p of players) {
    const hand = await cardRepo.findHand(gameId, p.playerId);
    hands[`player_${p.playerId}`] = hand.map((c) => `${c.color} ${c.value}`);

    const info = playersWithInfo.find((row) => row.playerId === p.playerId);
    const name =
      info?.player?.username || info?.player?.name || `player_${p.playerId}`;
    participants.push({
      playerId: p.playerId,
      username: name,
      handCount: hand.length,
      saidUno: Boolean(p.saidUno),
      saidUnoAt: p.saidUnoAt || null,
    });
  }

  return {
    currentPlayer: game.currentPlayerId,
    topCard: `${game.discardTopColor} ${game.discardTopValue}`,
    hands,
    participants,
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

