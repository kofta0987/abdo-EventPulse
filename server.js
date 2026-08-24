require("dotenv").config();
const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const setupSocket = require("./socket");
const PORT = process.env.PORT || 3000;
const startServer = async () => {
  await connectDB();
  const server = http.createServer(app);
  setupSocket(server);
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};
startServer().catch((error) => {
  console.error(error);
  process.exit(1);
});