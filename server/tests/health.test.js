import { describe, it, expect } from "vitest";
import request from "supertest";
import { mongoAvailable } from "./setup.js";

describe.skipIf(!mongoAvailable)("GET /api/v1/health", () => {
  it("returns healthy status when MongoDB is connected", async () => {
    const { default: app } = await import("../src/app.js");
    const res = await request(app).get("/api/v1/health");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      message: "Service is healthy",
      data: {
        status: "ok",
        services: {
          mongodb: "connected",
          redis: "not_configured",
        },
      },
    });
    expect(res.body.data.timestamp).toBeTypeOf("string");
  });
});
