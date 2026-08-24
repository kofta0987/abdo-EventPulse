const express = require("express");
const { body } = require("express-validator");
const {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");
const {
  requireAuth,
  requireRole,
} = require("../middleware/auth");
const validate = require("../middleware/validation");
const router = express.Router();
router.get("/", getEvents);
router.get("/:id", getEvent);
router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required"),
    body("description")
      .notEmpty()
      .withMessage("Description is required"),
    body("date")
      .isISO8601()
      .withMessage("Valid date is required"),
    body("location")
      .trim()
      .notEmpty()
      .withMessage("Location is required"),
    body("city")
      .trim()
      .notEmpty()
      .withMessage("City is required"),
    body("category")
      .isMongoId()
      .withMessage("Valid category ID is required"),
    body("capacity")
      .isInt({ min: 1 })
      .withMessage("Capacity must be at least 1"),
  ],
  validate,
  createEvent
);
router.patch(
  "/:id",
  requireAuth,
  requireRole("admin"),
  [
    body("title")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Title cannot be empty"),
    body("description")
      .optional()
      .notEmpty()
      .withMessage("Description cannot be empty"),
    body("date")
      .optional()
      .isISO8601()
      .withMessage("Valid date is required"),
    body("capacity")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Capacity must be at least 1"),
    body("category")
      .optional()
      .isMongoId()
      .withMessage("Valid category ID is required"),
  ],
  validate,
  updateEvent
);
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  deleteEvent
);
module.exports = router;