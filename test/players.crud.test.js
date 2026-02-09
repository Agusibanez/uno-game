const request = require("supertest");
const app = require("../src/app");

describe("Players CRUD", () => {
  test("Create player OK (1)", async () => {
    const res = await request(app).post("/api/players").send({
      name: "Player A",
      age: 20,
      email: "a@mail.com",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.email).toBe("a@mail.com");
  });

  test("Read player OK (1)", async () => {
    const created = await request(app).post("/api/players").send({
      name: "Player A",
      age: 20,
      email: "a@mail.com",
    });

    const res = await request(app).get(`/api/players/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe("a@mail.com");
  });

  test("Update player OK (1)", async () => {
    const created = await request(app).post("/api/players").send({
      name: "Player A",
      age: 20,
      email: "a@mail.com",
    });

    const res = await request(app).put(`/api/players/${created.body.id}`).send({
      name: "Player Updated",
    });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Player Updated");
  });

  test("Delete player OK (1)", async () => {
    const created = await request(app).post("/api/players").send({
      name: "Player A",
      age: 20,
      email: "a@mail.com",
    });

    const del = await request(app).delete(`/api/players/${created.body.id}`);
    expect(del.status).toBe(200);
    expect(del.body).toEqual({ message: "Player deleted" });

    const read = await request(app).get(`/api/players/${created.body.id}`);
    expect(read.status).toBe(404);
  });
});
