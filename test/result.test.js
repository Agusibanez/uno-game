const { ok, err, ResultAsync } = require("../src/utils/result");

describe("Result Monad", () => {
  test("Ok.map transforma valor", () => {
    const r = ok(2).map((x) => x + 3);
    expect(r.isOk()).toBe(true);
    expect(r.unwrap()).toBe(5);
  });

  test("Err.map no ejecuta transformaciones", () => {
    const r = err(new Error("boom")).map((x) => x + 1);
    expect(r.isErr()).toBe(true);
    expect(() => r.unwrap()).toThrow("boom");
  });

  test("Ok.chain encadena Result", () => {
    const r = ok(5).chain((x) => ok(x * 2));
    expect(r.isOk()).toBe(true);
    expect(r.unwrap()).toBe(10);
  });

  test("Err.chain corta la cadena", () => {
    const r = err(new Error("stop")).chain(() => ok(999));
    expect(r.isErr()).toBe(true);
    expect(() => r.unwrap()).toThrow("stop");
  });

  test("ResultAsync.fromPromise Ok", async () => {
    const ra = ResultAsync.fromPromise(() => Promise.resolve(10));
    const r = await ra.map((x) => x + 1).run();
    expect(r.isOk()).toBe(true);
    expect(r.unwrap()).toBe(11);
  });

  test("ResultAsync.fromPromise Err", async () => {
    const ra = ResultAsync.fromPromise(
      () => Promise.reject(new Error("x")),
      () => new Error("mapped"),
    );
    const r = await ra.run();
    expect(r.isErr()).toBe(true);
    expect(() => r.unwrap()).toThrow("mapped");
  });
});
