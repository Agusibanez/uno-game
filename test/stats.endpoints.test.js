const request = require("supertest");
const app = require("../src/app");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("Stats endpoints", () => {
  test("should expose requests/response-times/status-codes/popular-endpoints", async () => {
    await request(app).get("/api/players/999999");
    await request(app).get("/api/games/999999");
    await request(app).post("/api/auth/login").send({
      username: "missing",
      password: "missing",
    });

    await sleep(25);

    const requestsRes = await request(app).get("/api/stats/requests");
    expect(requestsRes.status).toBe(200);
    expect(requestsRes.body).toHaveProperty("total_requests");
    expect(requestsRes.body).toHaveProperty("breakdown");
    expect(requestsRes.body.breakdown["/api/players/999999"]).toHaveProperty(
      "GET",
    );

    const responseRes = await request(app).get("/api/stats/response-times");
    expect(responseRes.status).toBe(200);
    expect(responseRes.body["/api/players/999999"]).toHaveProperty("avg");
    expect(responseRes.body["/api/players/999999"]).toHaveProperty("min");
    expect(responseRes.body["/api/players/999999"]).toHaveProperty("max");

    const statusRes = await request(app).get("/api/stats/status-codes");
    expect(statusRes.status).toBe(200);
    expect(statusRes.body["404"]).toBeGreaterThanOrEqual(1);
    expect(statusRes.body["401"]).toBeGreaterThanOrEqual(1);

    const popularRes = await request(app).get("/api/stats/popular-endpoints");
    expect(popularRes.status).toBe(200);
    expect(popularRes.body).toHaveProperty("most_popular");
    expect(popularRes.body).toHaveProperty("request_count");
  });
});
