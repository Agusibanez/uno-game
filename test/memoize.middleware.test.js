const request = require("supertest");
const express = require("express");
const { memoizeMiddleware } = require("../src/middlewares/memoize.middleware");

describe("Memoize middleware (LRU + TTL reset)", () => {
  test("MISS then HIT on repeated GET", async () => {
    const app = express();

    let counter = 0;
    app.use(
      memoizeMiddleware({
        max: 50,
        maxAge: 1000,
        methods: ["GET"],
      }),
    );

    app.get("/api/ping", (req, res) => {
      counter += 1;
      res.json({ counter });
    });

    const r1 = await request(app).get("/api/ping");
    expect(r1.header["x-cache"]).toBe("MISS");
    expect(r1.body.counter).toBe(1);

    const r2 = await request(app).get("/api/ping");
    expect(r2.header["x-cache"]).toBe("HIT");
    expect(r2.body.counter).toBe(1);
  });

  test("TTL resets on access", async () => {
    jest.useFakeTimers();
    const app = express();

    let counter = 0;
    app.use(
      memoizeMiddleware({
        max: 50,
        maxAge: 1000,
        methods: ["GET"],
      }),
    );

    app.get("/api/ping", (req, res) => {
      counter += 1;
      res.json({ counter });
    });

    const r1 = await request(app).get("/api/ping");
    expect(r1.body.counter).toBe(1);

    jest.advanceTimersByTime(700);
    const r2 = await request(app).get("/api/ping");
    expect(r2.header["x-cache"]).toBe("HIT");
    expect(r2.body.counter).toBe(1);

    jest.advanceTimersByTime(700);
    const r3 = await request(app).get("/api/ping");
    expect(r3.header["x-cache"]).toBe("HIT");
    expect(r3.body.counter).toBe(1);

    jest.useRealTimers();
  });

  test("LRU eviction when max is reached", async () => {
    const app = express();
    const mw = memoizeMiddleware({ max: 2, maxAge: 5000 });

    let counter = 0;
    app.use(mw);

    app.get("/api/a", (req, res) => {
      counter += 1;
      res.json({ k: "a", counter });
    });
    app.get("/api/b", (req, res) => {
      counter += 1;
      res.json({ k: "b", counter });
    });
    app.get("/api/c", (req, res) => {
      counter += 1;
      res.json({ k: "c", counter });
    });

    await request(app).get("/api/a");
    await request(app).get("/api/b");
    await request(app).get("/api/a");

    await request(app).get("/api/c");

    const b = await request(app).get("/api/b");
    expect(b.header["x-cache"]).toBe("MISS");
  });
});
