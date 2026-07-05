import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../src/modules/auth/auth.validation.js";

describe("auth validation schemas", () => {
  describe("registerSchema", () => {
    it("accepts valid registration data", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "password123",
        confirmPassword: "password123",
        firstName: "Jane",
        role: "buyer",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.confirmPassword).toBeUndefined();
      }
    });

    it("rejects short passwords", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "short",
        confirmPassword: "short",
      });
      expect(result.success).toBe(false);
    });

    it("rejects mismatched passwords", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "password123",
        confirmPassword: "different123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("confirmPassword");
      }
    });

    it("rejects invalid email", () => {
      const result = registerSchema.safeParse({
        email: "not-an-email",
        password: "password123",
        confirmPassword: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("defaults role to buyer", () => {
      const result = registerSchema.parse({
        email: "user@example.com",
        password: "password123",
        confirmPassword: "password123",
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

  describe("verifyEmailSchema", () => {
    it("requires token", () => {
      expect(verifyEmailSchema.safeParse({}).success).toBe(false);
      expect(verifyEmailSchema.safeParse({ token: "abc" }).success).toBe(true);
    });
  });
});
