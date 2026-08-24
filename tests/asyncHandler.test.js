const AppError = require("../utils/AppError");
describe("AppError", () => {
  test("creates an error with message and status", () => {
    const error = new AppError("Test error", 400);
    expect(error.message).toBe("Test error");
    expect(error.statusCode).toBe(400);
  });
  test("uses 500 by default", () => {
    const error = new AppError("Server error");
    expect(error.statusCode).toBe(500);
  });
});