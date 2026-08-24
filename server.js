require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
let dbConnected = false;
const startServer = async () => {
  try {
    await connectDB();
    dbConnected = true;
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
};
startServer();
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