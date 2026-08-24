const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const Event = require("./models/Event");
const Registration = require("./models/Registration");
const Message = require("./models/Message");
const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication required"));
      }
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error("User not found"));
      }
      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Invalid or expired token"));
    }
  });
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    socket.on("join_event", async (eventId) => {
      try {
        const event = await Event.findById(eventId);
        if (!event) {
          socket.emit("error_message", "Event not found");
          return;
        }
        if (socket.user.role !== "admin") {
          const registration = await Registration.findOne({
            user: socket.user._id,
            event: eventId,
          });
          if (!registration) {
            socket.emit(
              "error_message",
              "You are not registered for this event"
            );
            return;
          }
        }
        socket.join(`event:${eventId}`);
        socket.emit("joined_event", {
          eventId,
          message: "Joined event room",
        });
      } catch (error) {
        socket.emit(
          "error_message",
          "Could not join event"
        );
      }
    });
    socket.on(
      "announcement",
      async ({ eventId, message }) => {
        try {
          if (socket.user.role !== "admin") {
            socket.emit(
              "error_message",
              "Only admins can send announcements"
            );
            return;
          }
          const event = await Event.findById(eventId);

          if (!event) {
            socket.emit(
              "error_message",
              "Event not found"
            );
            return;
          }
          const savedMessage = await Message.create({
            event: eventId,
            sender: socket.user._id,
            message,
          });
          const populatedMessage =
            await savedMessage.populate(
              "sender",
              "name email role"
            );
          io.to(`event:${eventId}`).emit(
            "announcement",
            populatedMessage
          );
        } catch (error) {
          socket.emit(
            "error_message",
            "Announcement could not be sent"
          );
        }
      }
    );
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
  return io;
};
module.exports = setupSocket;