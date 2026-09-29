import { expect } from "vitest";
import { api } from "./http.js";
import { ensureTestSites } from "./siteFixtures.js";

export const registerPayload = (overrides = {}) => ({
  email: "user@example.com",
  password: "password123",
  confirmPassword: "password123",
  firstName: "Test",
  role: "seller",
  ...overrides,
});

/**
 * @param {import("express").Application} app
 * @param {string | Record<string, unknown>} overridesOrEmail
 */
export async function registerAndGetToken(app, overridesOrEmail = {}) {
  await ensureTestSites();
  const overrides =
    typeof overridesOrEmail === "string"
      ? { email: overridesOrEmail }
      : overridesOrEmail;
  const res = await api(app)
    .post("/api/v1/auth/register")
    .send(registerPayload(overrides));
  expect(res.status, res.body?.message || JSON.stringify(res.body)).toBe(201);
  expect(res.body.data?.accessToken).toBeTypeOf("string");
  return res.body.data.accessToken;
}
