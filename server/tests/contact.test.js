import { describe, expect, it } from "vitest";
import { api } from "./helpers/http.js";
import { mongoAvailable } from "./setup.js";

describe.skipIf(!mongoAvailable)("POST /api/v1/contact", () => {
  it("accepts a valid contact submission", async () => {
    const { default: app } = await import("../src/app.js");

    const res = await api(app).post("/api/v1/contact").send({
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com",
      message: "I would like help finding a property.",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it("returns 400 for invalid email", async () => {
    const { default: app } = await import("../src/app.js");

    const res = await api(app).post("/api/v1/contact").send({
      firstName: "Jane",
      lastName: "Smith",
      email: "not-an-email",
      message: "Valid length message here.",
    });

    expect(res.status).toBe(400);
  });
});
