const express = require("express");
const {
  getEventMessages,
} = require("../controllers/messageController");
const {
  requireAuth,
} = require("../middleware/auth");
const router = express.Router();
router.get(
  "/event/:eventId",
  requireAuth,
  getEventMessages
);
module.exports = router;