import { ZodError } from "zod";
import { AppError } from "../shared/AppError.js";
import { env } from "../config/env.js";

export const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let errors = err.errors || null;

  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    errors = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
  } else if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `${field} already exists`;
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  } else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  if (env.NODE_ENV === "production" && !err.isOperational) {
    message = "Internal server error";
    errors = null;
  }

  if (env.NODE_ENV === "development") {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(env.NODE_ENV === "development" &&
      !err.isOperational && { stack: err.stack }),
  });
};

export const notFoundHandler = (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};
