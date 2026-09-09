import { describe, it, expect } from "vitest";
import request from "supertest";
import { mongoAvailable } from "./setup.js";
import { AgentProfile } from "../src/modules/agents/agent.model.js";

const getApp = async () => {
  const { default: app } = await import("../src/app.js");
  return app;
};

describe.skipIf(!mongoAvailable)("agents API", () => {
  it("lists public agents and returns profile detail", async () => {
    const app = await getApp();
    const email = "agent-list@example.com";

    const registered = await request(app)
      .post("/api/v1/auth/register")
      .send({
        email,
        password: "password123",
        confirmPassword: "password123",
        firstName: "Agent",
        lastName: "Smith",
        role: "agent",
      });

    expect(registered.status).toBe(201);
    const agentId = registered.body.data.user.id;

    await AgentProfile.findOneAndUpdate(
      { userId: agentId },
      { agency: "Buytly Realty", city: "Dubai", specialties: ["luxury"] },
      { upsert: true },
    );

    const listRes = await request(app).get("/api/v1/agents?city=Dubai");

    expect(listRes.status).toBe(200);
    expect(listRes.body.success).toBe(true);
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);

    const detailRes = await request(app).get(`/api/v1/agents/${agentId}`);

    expect(detailRes.status).toBe(200);
    expect(detailRes.body.data.user.firstName).toBe("Agent");
    expect(detailRes.body.data.profile.city).toBe("Dubai");
  });
});
