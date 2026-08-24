const Event = require("../models/Event");
const Category = require("../models/Category");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const createEvent = asyncHandler(async (req, res, next) => {
  const {
    title,
    description,
    date,
    location,
    city,
    category,
    capacity,
  } = req.body;
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    return next(new AppError("Category not found", 404));
  }
  const event = await Event.create({
    title,
    description,
    date,
    location,
    city,
    category,
    capacity,
  });
  const result = await event.populate("category");
  res.status(201).json({
    status: "success",
    data: result,
  });
});
const getEvents = asyncHandler(async (req, res) => {
  const {
    category,
    city,
    startDate,
    endDate,
    search,
    page = 1,
    limit = 10,
    sortBy = "date",
  } = req.query;
  const filter = {};
  if (category) {
    filter.category = category;
  }
  if (city) {
    filter.city = new RegExp(`^${city}$`, "i");
  }
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) {
      filter.date.$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.date.$lte = end;
    }
  }
  if (search) {
    const regex = new RegExp(search, "i");
    filter.$or = [
      { title: regex },
      { description: regex },
    ];
  }
  const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
  const limitNumber = Math.min(
    Math.max(parseInt(limit, 10) || 10, 1),
    100
  );
  const total = await Event.countDocuments(filter);
  let sort = {};
  if (sortBy === "registrations") {
    sort.registrationsCount = -1;
  } else {
    sort.date = 1;
  }
  const events = await Event.find(filter)
    .populate("category")
    .sort(sort)
    .skip((pageNumber - 1) * limitNumber)
    .limit(limitNumber);
  const totalPages = Math.ceil(total / limitNumber);
  res.json({
    status: "success",
    data: events,
    pagination: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages,
    },
  });
});

const getEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id)
    .populate("category");

  if (!event) {
    return next(new AppError("Event not found", 404));
  }

  res.json({
    status: "success",
    data: event,
  });
});

const updateEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new AppError("Event not found", 404));
  }

  if (req.body.category) {
    const categoryExists = await Category.findById(req.body.category);

    if (!categoryExists) {
      return next(new AppError("Category not found", 404));
    }
  }

  Object.assign(event, req.body);

  await event.save();

  await event.populate("category");

  res.json({
    status: "success",
    data: event,
  });
});

const deleteEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new AppError("Event not found", 404));
  }

  await event.deleteOne();

  res.json({
    status: "success",
    message: "Event deleted successfully",
  });
});

module.exports = {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
};