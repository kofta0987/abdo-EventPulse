require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Category = require("./models/Category");
const Event = require("./models/Event");
const Registration = require("./models/Registration");
const Message = require("./models/Message");
const seed = async () => {
  try {
    await connectDB();
    await Message.deleteMany({});
    await Registration.deleteMany({});
    await Event.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});
    const categories = await Category.insertMany([
      {
        name: "Music",
        description: "Music events",
      },
      {
        name: "Tech",
        description: "Technology events",
      },
      {
        name: "Sports",
        description: "Sports events",
      },
    ]);
    const adminPassword = await bcrypt.hash(
      "Admin123!",
      12
    );
    const attendeePassword = await bcrypt.hash(
      "Attendee123!",
      12
    );
    const admin = await User.create({
      name: "EventPulse Admin",
      email: "admin@eventpulse.com",
      password: adminPassword,
      role: "admin",
    });
    await User.create({
      name: "Test Attendee",
      email: "attendee@eventpulse.com",
      password: attendeePassword,
      role: "attendee",
    });
    await Event.insertMany([
      {
        title: "Cairo Music Festival",
        description:
          "A large music festival featuring local artists.",
        date: new Date("2026-09-15T18:00:00"),
        location: "Cairo Stadium",
        city: "Cairo",
        category: categories[0]._id,
        capacity: 100,
      },
      {
        title: "Future Technology Conference",
        description:
          "Technology, software and innovation conference.",
        date: new Date("2026-10-10T10:00:00"),
        location: "New Cairo",
        city: "Cairo",
        category: categories[1]._id,
        capacity: 50,
      },
      {
        title: "Community Sports Day",
        description:
          "A day of sports and community activities.",
        date: new Date("2026-11-05T09:00:00"),
        location: "Nasr City",
        city: "Cairo",
        category: categories[2]._id,
        capacity: 75,
      },
    ]);
    console.log("Database seeded successfully");
    console.log("Admin email: admin@eventpulse.com");
    console.log("Admin password: Admin123!");
    console.log("Admin ID:", admin._id);
    await mongoose.connection.close();
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};
seed();