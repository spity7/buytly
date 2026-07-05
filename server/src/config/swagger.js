import swaggerJsdoc from "swagger-jsdoc";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { env } from "./env.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// swagger-jsdoc glob fails on Windows backslashes — normalize to forward slashes
const apiGlob = (relativePath) =>
  join(__dirname, relativePath).replace(/\\/g, "/");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Buytly API",
      version: "1.0.0",
      description:
        "Production-ready real estate marketplace backend API. " +
        "All successful responses use `{ success, message, data }`. " +
        "Paginated lists add a top-level `pagination` object. " +
        "OpenAPI spec is Orval-compatible — each operation has an `operationId`.",
      contact: {
        name: "Buytly",
      },
      license: {
        name: "Proprietary",
      },
    },
    servers: [
      {
        url: env.API_URL,
        description:
          env.NODE_ENV === "production"
            ? "Production server"
            : "Development server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    tags: [
      { name: "Health", description: "Service health" },
      { name: "Auth", description: "Authentication" },
      { name: "Users", description: "User profiles" },
      { name: "Properties", description: "Property listings" },
      { name: "Agents", description: "Agent profiles" },
      { name: "Favorites", description: "Saved properties" },
      { name: "Bookings", description: "Visit scheduling" },
      { name: "Transactions", description: "Buy/rent transactions" },
      { name: "Admin", description: "Administration" },
      { name: "Notifications", description: "Notifications" },
    ],
  },
  apis: [
    apiGlob("./swagger.schemas.js"),
    apiGlob("../modules/**/*.routes.js"),
    apiGlob("../routes/index.js"),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
