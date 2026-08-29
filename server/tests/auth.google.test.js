import { describe, it, expect, vi, beforeEach } from "vitest";
import { mongoAvailable } from "./setup.js";
import { AppError } from "../src/shared/AppError.js";
import { User } from "../src/modules/users/user.model.js";
import { AgentProfile } from "../src/modules/agents/agent.model.js";
import { generatePasswordResetToken } from "../src/services/token.service.js";

vi.mock("../src/services/google.service.js", () => ({
  googleService: {
    verifyIdToken: vi.fn(),
  },
}));

vi.mock("../src/services/email.service.js", () => ({
  emailService: {
    sendEmailVerification: vi.fn(),
    sendPasswordReset: vi.fn(),
  },
}));

vi.mock("../src/modules/notifications/notification.service.js", () => ({
  notificationService: {
    notify: vi.fn().mockResolvedValue(undefined),
  },
}));

const { googleService } = await import("../src/services/google.service.js");
const { authService } = await import("../src/modules/auth/auth.service.js");

const googleProfile = {
  googleId: "google-sub-123",
  email: "google-user@example.com",
  emailVerified: true,
  firstName: "Google",
  lastName: "User",
};

describe.skipIf(!mongoAvailable)("authService.googleAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    googleService.verifyIdToken.mockResolvedValue(googleProfile);
  });

  it("creates a new Google user and returns tokens", async () => {
    const result = await authService.googleAuth({
      idToken: "valid-id-token",
      role: "buyer",
    });

    expect(result.accessToken).toBeTypeOf("string");
    expect(result.refreshToken).toBeTypeOf("string");
    expect(result.user.email).toBe("google-user@example.com");
    expect(result.user.authProvider).toBe("google");
    expect(result.user.isEmailVerified).toBe(true);

    const stored = await User.findOne({
      email: "google-user@example.com",
    }).select("+googleId");
    expect(stored?.authProvider).toBe("google");
    expect(stored?.googleId).toBe("google-sub-123");
  });

  it("creates an agent profile for new Google agent sign-ups", async () => {
    const result = await authService.googleAuth({
      idToken: "valid-id-token",
      role: "agent",
    });

    expect(result.user.role).toBe("agent");
    const profile = await AgentProfile.findOne({ userId: result.user.id });
    expect(profile).not.toBeNull();
  });

  it("logs in an existing Google-linked user", async () => {
    await User.create({
      email: googleProfile.email,
      googleId: googleProfile.googleId,
      authProvider: "google",
      isEmailVerified: true,
    });

    const result = await authService.googleAuth({
      idToken: "valid-id-token",
    });

    expect(result.user.email).toBe(googleProfile.email);
    expect(await User.countDocuments({ email: googleProfile.email })).toBe(1);
  });

  it("links Google to an existing password account and auto-verifies email", async () => {
    await User.create({
      email: googleProfile.email,
      passwordHash: "hashed-password",
      authProvider: "local",
      isEmailVerified: false,
    });

    const result = await authService.googleAuth({ idToken: "valid-id-token" });

    expect(result.user.email).toBe(googleProfile.email);
    expect(result.user.authProvider).toBe("both");
    expect(result.user.isEmailVerified).toBe(true);
    expect(await User.countDocuments({ email: googleProfile.email })).toBe(1);

    const stored = await User.findOne({ email: googleProfile.email }).select(
      "+googleId +emailVerificationToken",
    );
    expect(stored?.googleId).toBe(googleProfile.googleId);
    expect(stored?.emailVerificationToken).toBeUndefined();
  });

  it("rejects Google sign-in when email is linked to a different Google account", async () => {
    await User.create({
      email: googleProfile.email,
      passwordHash: "hashed-password",
      googleId: "other-google-sub",
      authProvider: "both",
      isEmailVerified: true,
    });

    await expect(
      authService.googleAuth({ idToken: "valid-id-token" }),
    ).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it("rejects unverified Google emails", async () => {
    googleService.verifyIdToken.mockResolvedValue({
      ...googleProfile,
      emailVerified: false,
    });

    await expect(
      authService.googleAuth({ idToken: "valid-id-token" }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it("sets authProvider to both when a Google-only user resets password", async () => {
    const { token, hashed, expires } = generatePasswordResetToken();

    await User.create({
      email: googleProfile.email,
      googleId: googleProfile.googleId,
      authProvider: "google",
      isEmailVerified: true,
      passwordResetToken: hashed,
      passwordResetExpires: expires,
    });

    await authService.resetPassword(token, "newpassword123");

    const stored = await User.findOne({ email: googleProfile.email }).select(
      "+passwordHash +googleId",
    );
    expect(stored?.authProvider).toBe("both");
    expect(stored?.googleId).toBe(googleProfile.googleId);
    expect(stored?.passwordHash).toBeTypeOf("string");
  });
});
