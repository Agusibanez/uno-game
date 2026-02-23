function buildBasicDeck(gameId) {
  const colors = ["red", "blue", "green", "yellow"];
  const cards = [];

  for (const c of colors) {
    for (let n = 0; n <= 9; n++) {
      cards.push({ color: c, value: String(n), gameId });
      if (n !== 0) cards.push({ color: c, value: String(n), gameId }); 
    }
    ["skip", "reverse", "+2"].forEach((v) => {
      cards.push({ color: c, value: v, gameId });
      cards.push({ color: c, value: v, gameId });
    });
  }

  for (let i = 0; i < 4; i++)
    cards.push({ color: "black", value: "wild", gameId });
  for (let i = 0; i < 4; i++)
    cards.push({ color: "black", value: "wild+4", gameId });

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
