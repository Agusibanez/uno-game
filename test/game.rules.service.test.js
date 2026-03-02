jest.mock("../src/repositories", () => ({
  gameRepo: {
    findById: jest.fn(),
    save: jest.fn(),
  },
  gamePlayerRepo: {
    findAllByGame: jest.fn(),
    findOne: jest.fn(),
    setUno: jest.fn(),
  },
  cardRepo: {
    findCardInHand: jest.fn(),
    moveToDiscard: jest.fn(),
    countHand: jest.fn(),
    findPlayableInHand: jest.fn(),
    findDeckTop: jest.fn(),
    moveToHand: jest.fn(),
    findHand: jest.fn(),
  },
  moveRepo: {
    create: jest.fn(),
  },
  scoreRepo: {
    updateById: jest.fn(),
  },
}));

jest.mock("../src/domain/uno/validators", () => ({
  validateDealPayload: jest.fn(),
  assertGameStarted: jest.fn(),
}));

const {
  gameRepo,
  gamePlayerRepo,
  cardRepo,
  moveRepo,
  scoreRepo,
} = require("../src/repositories");
const validators = require("../src/domain/uno/validators");
const service = require("../src/services/game.rules.service");

describe("game.rules.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("advanceTurn moves clockwise by default", async () => {
    gamePlayerRepo.findAllByGame.mockResolvedValue([
      { playerId: 10 },
      { playerId: 20 },
      { playerId: 30 },
    ]);

    const game = { id: 1, currentPlayerId: 10, direction: 1 };
    await service.advanceTurn(game);

    expect(game.currentPlayerId).toBe(20);
  });

  test("advanceTurn moves counterclockwise and supports skip step", async () => {
    gamePlayerRepo.findAllByGame.mockResolvedValue([
      { playerId: 10 },
      { playerId: 20 },
      { playerId: 30 },
      { playerId: 40 },
    ]);

    const game = { id: 1, currentPlayerId: 20, direction: -1 };
    await service.advanceTurn(game, 2);

    expect(game.currentPlayerId).toBe(40);
  });

  test("playCard reverse changes direction and advances turn", async () => {
    const game = {
      id: 9,
      status: "started",
      currentPlayerId: 1,
      direction: 1,
      discardTopColor: "red",
      discardTopValue: "5",
    };

    gameRepo.findById.mockResolvedValue(game);
    gamePlayerRepo.findAllByGame.mockResolvedValue([
      { playerId: 1 },
      { playerId: 2 },
      { playerId: 3 },
    ]);
    cardRepo.findCardInHand.mockResolvedValue({
      id: 100,
      color: "red",
      value: "reverse",
    });
    cardRepo.countHand.mockResolvedValue(2);

    const result = await service.playCard(9, 1, { cardId: 100 });

    expect(cardRepo.moveToDiscard).toHaveBeenCalledWith(100);
    expect(moveRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ action: "play" }),
    );
    expect(game.direction).toBe(-1);
    expect(result.direction).toBe("counterclockwise");
    expect(result.nextPlayer).toBe(3);
    expect(gameRepo.save).toHaveBeenCalledWith(game);
  });

  test("playCard skip jumps one player", async () => {
    const game = {
      id: 10,
      status: "started",
      currentPlayerId: 1,
      direction: 1,
      discardTopColor: "blue",
      discardTopValue: "1",
    };

    gameRepo.findById.mockResolvedValue(game);
    gamePlayerRepo.findAllByGame.mockResolvedValue([
      { playerId: 1 },
      { playerId: 2 },
      { playerId: 3 },
      { playerId: 4 },
    ]);
    cardRepo.findCardInHand.mockResolvedValue({
      id: 101,
      color: "blue",
      value: "skip",
    });
    cardRepo.countHand.mockResolvedValue(3);

    const result = await service.playCard(10, 1, { cardId: 101 });
    expect(result.nextPlayer).toBe(3);
  });

  test("drawCard rejects when player has playable card", async () => {
    const game = {
      id: 11,
      status: "started",
      currentPlayerId: 8,
      direction: 1,
      discardTopColor: "yellow",
      discardTopValue: "2",
    };

    gameRepo.findById.mockResolvedValue(game);
    cardRepo.findPlayableInHand.mockResolvedValue([{ id: 1 }]);

    await expect(service.drawCard(11, 8)).rejects.toThrow(
      "You have a playable card. You must play.",
    );
  });

  test("drawCard draws until finds a playable card", async () => {
    const game = {
      id: 12,
      status: "started",
      currentPlayerId: 5,
      direction: 1,
      discardTopColor: "green",
      discardTopValue: "7",
    };

    gameRepo.findById.mockResolvedValue(game);
    cardRepo.findPlayableInHand.mockResolvedValue([]);
    gamePlayerRepo.findAllByGame.mockResolvedValue([
      { playerId: 5 },
      { playerId: 6 },
      { playerId: 7 },
    ]);

    cardRepo.findDeckTop
      .mockResolvedValueOnce({ id: 1, color: "red", value: "1" })
      .mockResolvedValueOnce({ id: 2, color: "green", value: "4" });

    const result = await service.drawCard(12, 5);

    expect(cardRepo.moveToHand).toHaveBeenCalledTimes(2);
    expect(result.cardsDrawn).toEqual(["red 1", "green 4"]);
    expect(result.playable).toBe(true);
    expect(result.nextPlayer).toBe(6);
    expect(moveRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "draw",
        detail: { cards: ["red 1", "green 4"], playable: true },
      }),
    );
  });

  test("services use validators on deal flow", async () => {
    gameRepo.findById.mockResolvedValue({
      id: 15,
      ownerId: 1,
      status: "started",
    });
    gamePlayerRepo.findAllByGame.mockResolvedValue([
      { playerId: 1 },
      { playerId: 2 },
    ]);
    cardRepo.findDeckTop.mockResolvedValue({ id: 1, color: "red", value: "1" });
    cardRepo.findHand.mockResolvedValue([]);

    await service.dealCards(15, 1, { cardsPerPlayer: 1 });
    expect(validators.validateDealPayload).toHaveBeenCalled();
    expect(validators.assertGameStarted).toHaveBeenCalled();
  });

  test("playCard ends game when player has no cards left", async () => {
    const game = {
      id: 20,
      status: "started",
      currentPlayerId: 1,
      direction: 1,
      discardTopColor: "red",
      discardTopValue: "9",
    };
    gameRepo.findById.mockResolvedValue(game);
    gamePlayerRepo.findAllByGame.mockResolvedValue([
      { playerId: 1 },
      { playerId: 2 },
    ]);
    cardRepo.findCardInHand.mockResolvedValue({
      id: 500,
      color: "red",
      value: "9",
    });
    cardRepo.countHand.mockResolvedValue(0);
    cardRepo.findHand.mockResolvedValue([]);

    const res = await service.playCard(20, 1, { cardId: 500 });

    expect(res.message).toMatch(/has won the game/i);
    expect(game.status).toBe("ended");
    expect(gameRepo.save).toHaveBeenCalledWith(game);
    expect(scoreRepo.updateById).toHaveBeenCalled();
  });

  test("sayUno succeeds with exactly one card", async () => {
    gameRepo.findById.mockResolvedValue({ id: 21, status: "started" });
    gamePlayerRepo.findOne.mockResolvedValue({ gameId: 21, playerId: 9 });
    cardRepo.countHand.mockResolvedValue(1);

    const res = await service.sayUno(21, 9);

    expect(res).toEqual({ message: "UNO said successfully." });
    expect(gamePlayerRepo.setUno).toHaveBeenCalledWith(21, 9, true);
  });

  test("sayUno fails if player does not have one card", async () => {
    gameRepo.findById.mockResolvedValue({ id: 22, status: "started" });
    gamePlayerRepo.findOne.mockResolvedValue({ gameId: 22, playerId: 9 });
    cardRepo.countHand.mockResolvedValue(3);

    await expect(service.sayUno(22, 9)).rejects.toThrow(
      "You can say UNO only when you have exactly 1 card",
    );
  });

  test("challengeUno applies penalty when challenged player forgot UNO", async () => {
    gameRepo.findById.mockResolvedValue({ id: 23, status: "started" });
    gamePlayerRepo.findOne.mockResolvedValue({
      gameId: 23,
      playerId: 2,
      saidUno: false,
    });
    cardRepo.countHand.mockResolvedValue(1);
    cardRepo.findDeckTop
      .mockResolvedValueOnce({ id: 41, color: "blue", value: "1" })
      .mockResolvedValueOnce({ id: 42, color: "yellow", value: "2" });

    const res = await service.challengeUno(23, 1, 2);

    expect(res.message).toMatch(/Challenge successful/i);
    expect(cardRepo.moveToHand).toHaveBeenCalledTimes(2);
    expect(gamePlayerRepo.setUno).toHaveBeenCalledWith(23, 2, false);
  });

  test("getFullStatus returns topCard and all hands", async () => {
    gameRepo.findById.mockResolvedValue({
      id: 24,
      currentPlayerId: 1,
      discardTopColor: "green",
      discardTopValue: "skip",
    });
    gamePlayerRepo.findAllByGame.mockResolvedValue([
      { playerId: 1 },
      { playerId: 2 },
    ]);
    cardRepo.findHand
      .mockResolvedValueOnce([{ color: "red", value: "1" }])
      .mockResolvedValueOnce([{ color: "blue", value: "2" }]);

    const res = await service.getFullStatus(24);

    expect(res.currentPlayer).toBe(1);
    expect(res.topCard).toBe("green skip");
    expect(res.hands.player_1).toEqual(["red 1"]);
    expect(res.hands.player_2).toEqual(["blue 2"]);
  });

  test("getMyHand returns only current player hand view", async () => {
    cardRepo.findHand.mockResolvedValue([
      { color: "black", value: "wild" },
      { color: "yellow", value: "3" },
    ]);

    const res = await service.getMyHand(30, 7);
    expect(res).toEqual({
      player: 7,
      hand: ["black wild", "yellow 3"],
    });
  });
});
