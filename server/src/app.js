import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { env, isSwaggerEnabled } from "./config/env.js";
import { swaggerSpec } from "./config/swagger.js";
import routes from "./routes/index.js";
import { globalRateLimiter } from "./middleware/rateLimit.js";
import { sanitizeInput } from "./middleware/sanitize.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();

if (env.TRUST_PROXY) {
  app.set("trust proxy", 1);
}

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN.split(",").map((o) => o.trim()),
    credentials: true,
  }),
);
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeInput);
app.use(globalRateLimiter);

if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

if (isSwaggerEnabled) {
  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: "Buytly API Docs",
    }),
  );

  app.get("/api/docs.json", (req, res) => {
    res.json(swaggerSpec);
  });
}

app.use("/api/v1", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
