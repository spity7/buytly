import mongoSanitize from "express-mongo-sanitize";

export const sanitizeInput = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = mongoSanitize.sanitize(req.body);
  }
  if (req.params && typeof req.params === "object") {
    req.params = mongoSanitize.sanitize(req.params);
  }
  next();
};
