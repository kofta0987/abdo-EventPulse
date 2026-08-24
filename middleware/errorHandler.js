const errorHandler = (err, req, res, next) => {
  console.error(err);
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  if (err.code === 11000) {
    statusCode = 409;
    message = "A record with this value already exists";
  }
  if (err.name === "ValidationError") {
    statusCode = 422;
    message = Object.values(err.errors)
      .map((error) => error.message)
      .join(", ");
  }
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID";
  }
  res.status(statusCode).json({
    status: "error",
    message,
  });
};
module.exports = errorHandler;