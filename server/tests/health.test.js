import { describe, it, expect, vi } from "vitest";
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
        },
      },
    });
    expect(res.body.data.timestamp).toBeTypeOf("string");
  });

  it("returns 503 when MongoDB is disconnected", async () => {
    const db = await import("../src/config/db.js");
    const spy = vi.spyOn(db, "isDBConnected").mockReturnValue(false);

    const { default: app } = await import("../src/app.js");
    const res = await request(app).get("/api/v1/health");

    expect(res.status).toBe(503);
    expect(res.body).toMatchObject({
      success: true,
      message: "Service degraded",
      data: {
        status: "degraded",
        services: {
          mongodb: "disconnected",
        },
      },
    });
    expect(res.body.data.timestamp).toBeTypeOf("string");

    spy.mockRestore();
  });
});
