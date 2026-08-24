require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
let dbPromise;
const ensureDB = async () => {
  if (!dbPromise) {
    dbPromise = connectDB();
  }
  await dbPromise;
};
app.use(async (req, res, next) => {
  try {
    await ensureDB();
    next();
  } catch (error) {
    console.error("Database connection failed:", error.message);
    res.status(500).json({
      status: "error",
      message: "Database connection failed"
    });
  }
});
if (process.env.NODE_ENV !== "production") {
  const http = require("http");
  const setupSocket = require("./socket");
  const PORT = process.env.PORT || 3000;

  const server = http.createServer(app);
  setupSocket(server);
  server.listen(PORT, () => {
    console.log(`Server running locally on port ${PORT}`);
  });
}
module.exports = app;