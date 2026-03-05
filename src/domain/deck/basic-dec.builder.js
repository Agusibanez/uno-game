function buildBasicDeck(gameId) {
  const colors = ["red", "blue", "green", "yellow"];
  const cards = [];

  for (const color of colors) {
    cards.push({ color, value: "0", gameId });

    for (let n = 1; n <= 9; n++) {
      cards.push({ color, value: String(n), gameId });
      cards.push({ color, value: String(n), gameId });
    }

    for (const value of ["skip", "reverse", "+2"]) {
      cards.push({ color, value, gameId });
      cards.push({ color, value, gameId });
    }
  }

  for (let i = 0; i < 4; i++) {
    cards.push({ color: "black", value: "wild", gameId });
    cards.push({ color: "black", value: "wild+4", gameId });
  }

  return cards;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildShuffledDeckWithPositions(gameId) {
  const base = buildBasicDeck(gameId);
  const shuffled = shuffle(base);

  return shuffled.map((c, idx) => ({
    ...c,
    location: "deck",
    ownerPlayerId: null,
    position: idx + 1,
  }));
}

module.exports = { buildBasicDeck, buildShuffledDeckWithPositions };
