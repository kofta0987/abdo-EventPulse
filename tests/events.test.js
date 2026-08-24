const request = require("supertest");
const jwt = require("jsonwebtoken");
jest.mock("../config/db", () => jest.fn());
jest.mock("../models/Event", () => ({
  countDocuments: jest.fn().mockResolvedValue(0),
  find: jest.fn(() => ({
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue([]),
  })),
}));
const app = require("../app");
describe("Events API", () => {
  test("GET /api/events returns a response", async () => {
    const response = await request(app)
      .get("/api/events");
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
  });
  test("POST /api/events without authentication returns 401", async () => {
    const response = await request(app)
      .post("/api/events")
      .send({
        title: "Test Event",
        description: "Test",
        date: "2026-12-01T10:00:00",
        location: "Cairo",
        city: "Cairo",
        category: "507f1f77bcf86cd799439011",
        capacity: 20,
      });
    expect(response.statusCode).toBe(401);
  });
  test("POST /api/events rejects invalid input with 422", async () => {
    const token = jwt.sign(
      {
        id: "507f1f77bcf86cd799439011",
        role: "admin",
      },
      process.env.JWT_SECRET
    );
    const response = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "",
        description: "",
        date: "not-a-date",
        location: "",
        city: "",
        category: "wrong",
        capacity: 0,
      });
    expect(response.statusCode).toBe(422);
  });
});