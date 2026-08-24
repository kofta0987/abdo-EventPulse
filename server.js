require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

// Connect to database on warm-up
connectDB();

// Only start the HTTP & Socket listener when running locally
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

// Export the Express app for Vercel
module.exports = app;