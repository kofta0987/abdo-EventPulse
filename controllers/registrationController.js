const Registration = require("../models/Registration");
const Event = require("../models/Event");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const registerForEvent = asyncHandler(async (req, res, next) => {
  const eventId = req.params.eventId;
  const userId = req.user.id;
  const event = await Event.findById(eventId);
  if (!event) {
    return next(new AppError("Event not found", 404));
  }
  const existingRegistration = await Registration.findOne({
    user: userId,
    event: eventId,
  });
  if (existingRegistration) {
    return next(
      new AppError("You are already registered for this event", 409)
    );
  }
  const updatedEvent = await Event.findOneAndUpdate(
    {
      _id: eventId,
      $expr: {
        $lt: ["$registrationsCount", "$capacity"],
      },
    },
    {
      $inc: {
        registrationsCount: 1,
      },
    },
    {
      new: true,
    }
  );
  if (!updatedEvent) {
    return next(
      new AppError("Event has reached its capacity", 409)
    );
  }
  try {
    const registration = await Registration.create({
      user: userId,
      event: eventId,
    });
    const result = await registration.populate([
      {
        path: "event",
        populate: {
          path: "category",
        },
      },
      {
        path: "user",
        select: "name email role",
      },
    ]);
    res.status(201).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    await Event.findByIdAndUpdate(eventId, {
      $inc: {
        registrationsCount: -1,
      },
    });
    if (error.code === 11000) {
      return next(
        new AppError(
          "You are already registered for this event",
          409
        )
      );
    }
    throw error;
  }
});
const getMyRegistrations = asyncHandler(async (req, res) => {
  const registrations = await Registration.find({
    user: req.user.id,
  })
    .populate({
      path: "event",
      populate: {
        path: "category",
      },
    })
    .sort({ createdAt: -1 });
  res.json({
    status: "success",
    data: registrations,
  });
});
const cancelRegistration = asyncHandler(async (req, res, next) => {
  const registration = await Registration.findOne({
    _id: req.params.id,
    user: req.user.id,
  });
  if (!registration) {
    return next(
      new AppError(
        "Registration not found or does not belong to you",
        404
      )
    );
  }
  await Registration.deleteOne({
    _id: registration._id,
  });
  await Event.findByIdAndUpdate(registration.event, {
    $inc: {
      registrationsCount: -1,
    },
  });
  res.json({
    status: "success",
    message: "Registration cancelled successfully",
  });
});
module.exports = {
  registerForEvent,
  getMyRegistrations,
  cancelRegistration,
};