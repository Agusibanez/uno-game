const {
  buildBasicDeck,
  buildShuffledDeckWithPositions,
} = require("../src/domain/deck/basic-dec.builder");

function countByColorValue(cards) {
  return cards.reduce((acc, c) => {
    const key = `${c.color}:${c.value}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

describe("basic UNO deck builder", () => {
  test("buildBasicDeck generates classic UNO deck (108 cards)", () => {
    const deck = buildBasicDeck(99);
    expect(deck).toHaveLength(108);

    const grouped = countByColorValue(deck);
    const colors = ["red", "blue", "green", "yellow"];

    for (const color of colors) {
      expect(grouped[`${color}:0`]).toBe(1);

      for (let n = 1; n <= 9; n++) {
        expect(grouped[`${color}:${n}`]).toBe(2);
      }

      expect(grouped[`${color}:skip`]).toBe(2);
      expect(grouped[`${color}:reverse`]).toBe(2);
      expect(grouped[`${color}:+2`]).toBe(2);
    }

    expect(grouped["black:wild"]).toBe(4);
    expect(grouped["black:wild+4"]).toBe(4);
  });

  test("buildShuffledDeckWithPositions adds metadata and keeps 108 cards", () => {
    const deck = buildShuffledDeckWithPositions(123);
    expect(deck).toHaveLength(108);

    const positions = deck.map((c) => c.position).sort((a, b) => a - b);
    expect(positions[0]).toBe(1);
    expect(positions[positions.length - 1]).toBe(108);
    expect(new Set(positions).size).toBe(108);

    for (const card of deck) {
      expect(card.gameId).toBe(123);
      expect(card.location).toBe("deck");
      expect(card.ownerPlayerId).toBeNull();
    }
  });
});
