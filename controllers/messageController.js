const Message = require("../models/Message");
const Event = require("../models/Event");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const getEventMessages = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) {
    return next(new AppError("Event not found", 404));
  }
  const messages = await Message.find({
    event: req.params.eventId,
  })
    .populate("sender", "name email role")
    .sort({ createdAt: 1 });
  res.json({
    status: "success",
    data: messages,
  });
});
module.exports = {
  getEventMessages,
};