const request = require("supertest");
const app = require("../src/app");

describe("GET /api/banknotes", () => {
  it("returns all banknotes as JSON array", async () => {
    const res = await request(app).get("/api/banknotes");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("each banknote has required fields", async () => {
    const res = await request(app).get("/api/banknotes");
    res.body.forEach((note) => {
      expect(note).toHaveProperty("id");
      expect(note).toHaveProperty("country");
      expect(note).toHaveProperty("currency");
      expect(note).toHaveProperty("denomination");
      expect(note).toHaveProperty("symbol");
      expect(note).toHaveProperty("year");
      expect(note).toHaveProperty("description");
    });
  });

  it("filters by country query parameter", async () => {
    const res = await request(app).get("/api/banknotes?country=Japan");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    res.body.forEach((note) => {
      expect(note.country.toLowerCase()).toBe("japan");
    });
  });

  it("filters by currency query parameter", async () => {
    const res = await request(app).get("/api/banknotes?currency=Euro");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    res.body.forEach((note) => {
      expect(note.currency.toLowerCase()).toBe("euro");
    });
  });

  it("returns empty array for unknown country", async () => {
    const res = await request(app).get("/api/banknotes?country=Narnia");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe("GET /api/banknotes/:id", () => {
  it("returns a single banknote by id", async () => {
    const res = await request(app).get("/api/banknotes/1");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", 1);
    expect(res.body).toHaveProperty("country");
  });

  it("returns 404 for a non-existent id", async () => {
    const res = await request(app).get("/api/banknotes/9999");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });
});
