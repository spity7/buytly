import jwt from "jsonwebtoken";
import { AppError } from "../shared/AppError.js";
import { env } from "../config/env.js";
import { User } from "../modules/users/user.model.js";

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError("Authentication required", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    const user = await User.findOne({
      _id: decoded.sub,
      deletedAt: null,
      isActive: true,
    });

    if (!user) {
      return next(new AppError("User not found or inactive", 401));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    const user = await User.findOne({
      _id: decoded.sub,
      deletedAt: null,
      isActive: true,
    });
    if (user) req.user = user;
  } catch {
    // ignore invalid token for optional auth
  }

  next();
};

export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError("Insufficient permissions", 403));
    }

    next();
  };
