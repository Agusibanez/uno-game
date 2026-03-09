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
    expect(result.direction).toBe("antihorario");
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

  test("playCard wild+4 requires chosenColor", async () => {
    const game = {
      id: 13,
      status: "started",
      currentPlayerId: 1,
      direction: 1,
      discardTopColor: "blue",
      discardTopValue: "5",
      drawStack: 0,
    };
    gameRepo.findById.mockResolvedValue(game);
    cardRepo.findCardInHand.mockResolvedValue({
      id: 201,
      color: "black",
      value: "wild+4",
    });

    await expect(service.playCard(13, 1, { cardId: 201 })).rejects.toThrow(
      "Las cartas wild requieren chosenColor",
    );
  });

  test("playCard wild+4 sets chosen color and increases drawStack", async () => {
    const game = {
      id: 14,
      status: "started",
      currentPlayerId: 1,
      direction: 1,
      discardTopColor: "blue",
      discardTopValue: "5",
      drawStack: 0,
    };
    gameRepo.findById.mockResolvedValue(game);
    gamePlayerRepo.findAllByGame.mockResolvedValue([
      { playerId: 1 },
      { playerId: 2 },
      { playerId: 3 },
    ]);
    cardRepo.findCardInHand.mockResolvedValue({
      id: 202,
      color: "black",
      value: "wild+4",
    });
    cardRepo.countHand.mockResolvedValue(3);

    const result = await service.playCard(14, 1, {
      cardId: 202,
      chosenColor: "yellow",
    });

    expect(game.discardTopColor).toBe("yellow");
    expect(game.drawStack).toBe(4);
    expect(result.drawStack).toBe(4);
    expect(result.nextPlayer).toBe(2);
  });

  test("playCard allows stacking +2 on existing drawStack", async () => {
    const game = {
      id: 16,
      status: "started",
      currentPlayerId: 2,
      direction: 1,
      discardTopColor: "red",
      discardTopValue: "wild+4",
      drawStack: 4,
    };
    gameRepo.findById.mockResolvedValue(game);
    gamePlayerRepo.findAllByGame.mockResolvedValue([
      { playerId: 1 },
      { playerId: 2 },
      { playerId: 3 },
    ]);
    cardRepo.findCardInHand.mockResolvedValue({
      id: 203,
      color: "blue",
      value: "+2",
    });
    cardRepo.countHand.mockResolvedValue(3);

    const result = await service.playCard(16, 2, { cardId: 203 });
    expect(game.drawStack).toBe(6);
    expect(result.drawStack).toBe(6);
    expect(result.nextPlayer).toBe(3);
  });

  test("drawCard allows drawing even when player has playable card", async () => {
    const game = {
      id: 11,
      status: "started",
      currentPlayerId: 8,
      direction: 1,
      discardTopColor: "yellow",
      discardTopValue: "2",
    };

    gameRepo.findById.mockResolvedValue(game);
    gamePlayerRepo.findAllByGame.mockResolvedValue([
      { playerId: 8 },
      { playerId: 9 },
    ]);
    cardRepo.findDeckTop.mockResolvedValue({ id: 901, color: "red", value: "7" });

    const result = await service.drawCard(11, 8);
    expect(result.cardsDrawn).toEqual(["red 7"]);
    expect(result.nextPlayer).toBe(9);
    expect(cardRepo.moveToHand).toHaveBeenCalledWith(901, 8);
  });

  test("drawCard (normal) draws only one card", async () => {
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

    cardRepo.findDeckTop.mockResolvedValueOnce({ id: 1, color: "red", value: "1" });

    const result = await service.drawCard(12, 5);

    expect(cardRepo.moveToHand).toHaveBeenCalledTimes(1);
    expect(result.cardsDrawn).toEqual(["red 1"]);
    expect(result.playable).toBe(false);
    expect(result.nextPlayer).toBe(6);
    expect(moveRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "draw",
        detail: { cards: ["red 1"], playable: false },
      }),
    );
  });

  test("drawCard with drawStack draws exact penalty and resets stack", async () => {
    const game = {
      id: 17,
      status: "started",
      currentPlayerId: 3,
      direction: 1,
      discardTopColor: "yellow",
      discardTopValue: "wild+4",
      drawStack: 6,
    };

    gameRepo.findById.mockResolvedValue(game);
    gamePlayerRepo.findAllByGame.mockResolvedValue([
      { playerId: 1 },
      { playerId: 2 },
      { playerId: 3 },
      { playerId: 4 },
    ]);

    cardRepo.findDeckTop
      .mockResolvedValueOnce({ id: 1, color: "red", value: "1" })
      .mockResolvedValueOnce({ id: 2, color: "red", value: "2" })
      .mockResolvedValueOnce({ id: 3, color: "red", value: "3" })
      .mockResolvedValueOnce({ id: 4, color: "red", value: "4" })
      .mockResolvedValueOnce({ id: 5, color: "red", value: "5" })
      .mockResolvedValueOnce({ id: 6, color: "red", value: "6" });

    const result = await service.drawCard(17, 3);
    expect(cardRepo.moveToHand).toHaveBeenCalledTimes(6);
    expect(result.cardsDrawn).toHaveLength(6);
    expect(result.playable).toBe(false);
    expect(result.drawStack).toBe(0);
    expect(game.drawStack).toBe(0);
    expect(result.nextPlayer).toBe(4);
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
    cardRepo.countHand
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);
    cardRepo.findDeckTop.mockResolvedValue({ id: 1, color: "red", value: "1" });
    cardRepo.findHand.mockResolvedValue([]);

    await service.dealCards(15, 1, { cardsPerPlayer: 1 });
    expect(validators.validateDealPayload).toHaveBeenCalled();
    expect(validators.assertGameStarted).toHaveBeenCalled();
  });

  test("dealCards fails if cards were already dealt", async () => {
    gameRepo.findById.mockResolvedValue({
      id: 18,
      ownerId: 1,
      status: "started",
    });
    gamePlayerRepo.findAllByGame.mockResolvedValue([
      { playerId: 1 },
      { playerId: 2 },
    ]);
    cardRepo.countHand
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(0);

    await expect(
      service.dealCards(18, 1, { cardsPerPlayer: 7 }),
    ).rejects.toThrow("Las cartas ya fueron repartidas en esta partida");
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

    expect(res.message).toMatch(/gano la partida/i);
    expect(game.status).toBe("ended");
    expect(gameRepo.save).toHaveBeenCalledWith(game);
    expect(scoreRepo.updateById).toHaveBeenCalled();
  });

  test("sayUno succeeds with exactly one card", async () => {
    gameRepo.findById.mockResolvedValue({ id: 21, status: "started" });
    gamePlayerRepo.findOne.mockResolvedValue({ gameId: 21, playerId: 9 });
    cardRepo.countHand.mockResolvedValue(1);

    const res = await service.sayUno(21, 9);

    expect(res).toEqual({ message: "Cantaste UNO correctamente." });
    expect(gamePlayerRepo.setUno).toHaveBeenCalledWith(21, 9, true);
  });

  test("sayUno fails if player does not have one card", async () => {
    gameRepo.findById.mockResolvedValue({ id: 22, status: "started" });
    gamePlayerRepo.findOne.mockResolvedValue({ gameId: 22, playerId: 9 });
    cardRepo.countHand.mockResolvedValue(3);

    await expect(service.sayUno(22, 9)).rejects.toThrow(
      "Solo puedes decir UNO cuando tienes exactamente 1 carta",
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

    expect(res.message).toMatch(/Desafio exitoso/i);
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
      { id: 11, color: "black", value: "wild" },
      { id: 12, color: "yellow", value: "3" },
    ]);

    const res = await service.getMyHand(30, 7);
    expect(res).toEqual({
      player: 7,
      hand: [
        { id: 11, color: "black", value: "wild", label: "black wild" },
        { id: 12, color: "yellow", value: "3", label: "yellow 3" },
      ],
    });
  });
});
