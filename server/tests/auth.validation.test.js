import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  resetPasswordSchema,
} from "../src/modules/auth/auth.validation.js";

describe("auth validation schemas", () => {
  describe("registerSchema", () => {
    it("accepts valid registration data", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "password123",
        firstName: "Jane",
        role: "buyer",
      });
      expect(result.success).toBe(true);
    });

    it("rejects short passwords", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "short",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid email", () => {
      const result = registerSchema.safeParse({
        email: "not-an-email",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("defaults role to buyer", () => {
      const result = registerSchema.parse({
        email: "user@example.com",
        password: "password123",
      });
      expect(result.role).toBe("buyer");
    });
  });

  describe("loginSchema", () => {
    it("requires email and password", () => {
      expect(loginSchema.safeParse({}).success).toBe(false);
      expect(
        loginSchema.safeParse({
          email: "user@example.com",
          password: "secret",
        }).success,
      ).toBe(true);
    });
  });

  describe("refreshSchema", () => {
    it("requires refreshToken", () => {
      expect(refreshSchema.safeParse({}).success).toBe(false);
      expect(refreshSchema.safeParse({ refreshToken: "abc" }).success).toBe(
        true,
      );
    });
  });

  describe("resetPasswordSchema", () => {
    it("requires token and password with min length", () => {
      expect(
        resetPasswordSchema.safeParse({ token: "t", password: "short" })
          .success,
      ).toBe(false);
      expect(
        resetPasswordSchema.safeParse({
          token: "reset-token",
          password: "newpassword",
        }).success,
      ).toBe(true);
    });
  });
});
