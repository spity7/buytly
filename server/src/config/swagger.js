import swaggerJsdoc from "swagger-jsdoc";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { env } from "./env.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const devServerUrl = `http://localhost:${env.PORT}/api/v1`;
const servers = [];

if (env.API_URL && env.API_URL !== devServerUrl) {
  servers.push({
    url: env.API_URL,
    description: "Production server",
  });
}

servers.push({
  url: env.API_URL || devServerUrl,
  description:
    env.API_URL && env.API_URL !== devServerUrl
      ? "Local development"
      : "Development server",
});

// swagger-jsdoc glob fails on Windows backslashes — normalize to forward slashes
const apiGlob = (relativePath) =>
  join(__dirname, relativePath).replace(/\\/g, "/");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Buytly API",
      version: "1.0.0",
      description: "Production-ready real estate marketplace backend API",
    },
    servers: servers,
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ApiResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: { type: "object" },
          },
        },
        PaginationMeta: {
          type: "object",
          properties: {
            page: { type: "integer" },
            limit: { type: "integer" },
            total: { type: "integer" },
            totalPages: { type: "integer" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string" },
                  message: { type: "string" },
                },
              },
            },
          },
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
  apis: [apiGlob("../modules/**/*.routes.js"), apiGlob("../routes/index.js")],
};

export const swaggerSpec = swaggerJsdoc(options);
