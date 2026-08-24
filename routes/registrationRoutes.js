const express = require("express");
const {
  registerForEvent,
  getMyRegistrations,
  cancelRegistration,
} = require("../controllers/registrationController");
const {
  requireAuth,
  requireRole,
} = require("../middleware/auth");
const router = express.Router();
router.get(
  "/my",
  requireAuth,
  getMyRegistrations
);
router.post(
  "/:eventId",
  requireAuth,
  requireRole("attendee"),
  registerForEvent
);
router.delete(
  "/:id",
  requireAuth,
  requireRole("attendee"),
  cancelRegistration
);
module.exports = router;