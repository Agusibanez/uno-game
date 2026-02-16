function buildBasicDeck(gameId) {
  const colors = ["red", "blue", "green", "yellow"];
  const cards = [];

  for (const c of colors) {
    for (let n = 1; n <= 9; n++) {
      cards.push({ color: c, value: String(n), gameId });
    }
    cards.push({ color: c, value: "skip", gameId });
    cards.push({ color: c, value: "reverse", gameId });
    cards.push({ color: c, value: "+2", gameId });
  }

  cards.push({ color: "black", value: "wild", gameId });
  cards.push({ color: "black", value: "wild+4", gameId });

  return cards;
}

module.exports = { buildBasicDeck };
