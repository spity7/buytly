import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mongoAvailable } from "./setup.js";
import { api } from "./helpers/http.js";
import { env } from "../src/config/env.js";
import {
  buildEmailSender,
  emailService,
} from "../src/services/email.service.js";
import { emailTemplates } from "../src/services/email.templates.js";
import {
  buildSiteLink,
  resolveSiteBrand,
  resolveSiteLinkBase,
} from "../src/services/siteBrand.js";
import { buildNotificationPayload } from "../src/modules/notifications/notification.catalog.js";
import { notificationService } from "../src/modules/notifications/notification.service.js";
import { Notification } from "../src/modules/notifications/notification.model.js";
import { Site } from "../src/modules/sites/site.model.js";
import { SITE_SLUG } from "../src/modules/sites/site.constants.js";
import { runWithRequestContext } from "../src/shared/requestContext.js";

const transport = vi.hoisted(() => ({
  sendMail: vi.fn(async () => ({})),
  sgSend: vi.fn(async () => [{}]),
  sgSetApiKey: vi.fn(),
}));

vi.mock("nodemailer", () => ({
  default: { createTransport: () => ({ sendMail: transport.sendMail }) },
}));

vi.mock("@sendgrid/mail", () => ({
  default: { setApiKey: transport.sgSetApiKey, send: transport.sgSend },
}));

const getApp = async () => {
  const { default: app } = await import("../src/app.js");
  return app;
};

/** Mirrors the seeded Block 57 site (site.service.js ensureDefaultSites). */
const block57Site = {
  slug: SITE_SLUG.BLOCK57,
  name: "Block 57",
  publicUrl: "https://block-57.com",
  branding: { siteDisplayName: "Block 57", supportEmail: "info@block-57.com" },
};

const buytlySite = {
  slug: SITE_SLUG.BUYTLY,
  name: "Buytly",
  publicUrl: "https://buytly.com",
  branding: {
    siteDisplayName: "Buytly",
    supportEmail: "buytlyonline@gmail.com",
  },
};

const inSite = (site, callback) => runWithRequestContext({ site }, callback);

describe("buildEmailSender", () => {
  it("uses a bare SMTP_FROM address with the brand as display name", () => {
    expect(buildEmailSender("noreply@test.com", "Block 57")).toEqual({
      name: "Block 57",
      address: "noreply@test.com",
    });
  });

  it("replaces the display name of a `Name <addr>` SMTP_FROM", () => {
    expect(buildEmailSender("Buytly <noreply@buytly.com>", "Block 57")).toEqual(
      { name: "Block 57", address: "noreply@buytly.com" },
    );
    expect(
      buildEmailSender(' "Buytly Team" <noreply@buytly.com> ', "Block 57"),
    ).toEqual({ name: "Block 57", address: "noreply@buytly.com" });
  });

  it("omits the display name when no brand name is given", () => {
    expect(buildEmailSender(" noreply@test.com ", "  ")).toEqual({
      address: "noreply@test.com",
    });
  });
});

describe("site brand resolution", () => {
  it("falls back to Buytly and APP_URL without a request site", () => {
    expect(resolveSiteBrand()).toEqual({
      name: "Buytly",
      url: "http://localhost:3000",
      supportEmail: "inbox@test.com",
    });
    expect(buildSiteLink("/reset-password?token=abc")).toBe(
      "http://localhost:3000/reset-password?token=abc",
    );
  });

  it("uses the request site's display name, public URL and support email", () => {
    inSite(block57Site, () => {
      expect(resolveSiteBrand()).toEqual({
        name: "Block 57",
        url: "http://localhost:3002",
        supportEmail: "info@block-57.com",
      });
      expect(buildSiteLink("/verify-email?token=abc")).toBe(
        "http://localhost:3002/verify-email?token=abc",
      );
    });
  });

  it("falls back to the site name when no display name is set", () => {
    const brand = resolveSiteBrand({
      slug: SITE_SLUG.BUILDWISE,
      name: "Buildwise Engineering",
      branding: { siteDisplayName: "  " },
    });
    expect(brand).toEqual({
      name: "Buildwise Engineering",
      url: "http://localhost:3001",
      supportEmail: "",
    });
  });

  it("falls back to APP_URL when a site has no public URL", () => {
    expect(resolveSiteLinkBase({ slug: "unknown-site" })).toBe(
      "http://localhost:3000",
    );
  });
});

describe("notification email links", () => {
  const context = {
    bookingId: "507f1f77bcf86cd799439011",
    propertyTitle: "A-101",
    status: "confirmed",
  };

  it("prefixes the Block 57 public URL for a Block 57 request", () => {
    const payload = inSite(block57Site, () =>
      buildNotificationPayload("booking.status_updated", context),
    );

    expect(payload.emailData.ctaUrl).toBe(
      "http://localhost:3002/dashboard-bookings?highlight=507f1f77bcf86cd799439011",
    );
    expect(payload.emailData).not.toHaveProperty("ctaPath");
    expect(payload.data.href).toBe(
      "/dashboard-bookings?highlight=507f1f77bcf86cd799439011",
    );
  });

  it("keeps the APP_URL links without a request site", () => {
    const payload = buildNotificationPayload("booking.status_updated", context);
    expect(payload.emailData.ctaUrl).toBe(
      "http://localhost:3000/dashboard-bookings?highlight=507f1f77bcf86cd799439011",
    );
  });

  it("names the site in the welcome notification", () => {
    expect(
      inSite(block57Site, () => buildNotificationPayload("auth.welcome")).title,
    ).toBe("Welcome to Block 57");
    expect(buildNotificationPayload("auth.welcome").title).toBe(
      "Welcome to Buytly",
    );
  });
});

describe("email delivery headers", () => {
  const originalNodeEnv = env.NODE_ENV;
  const originalProvider = env.EMAIL_PROVIDER;

  beforeEach(() => {
    // Leave the "test" short-circuit so the mocked transports are reached.
    env.NODE_ENV = "production";
    transport.sendMail.mockClear();
    transport.sgSend.mockClear();
  });

  afterEach(() => {
    env.NODE_ENV = originalNodeEnv;
    env.EMAIL_PROVIDER = originalProvider;
  });

  const verification = {
    name: "Ama",
    verifyUrl: "https://block-57.com/verify-email?token=abc",
  };

  it("sends SMTP mail from the site name with the site's subject", async () => {
    await inSite(block57Site, () =>
      emailService.sendEmailVerification("ama@example.com", verification),
    );

    expect(transport.sendMail).toHaveBeenCalledTimes(1);
    const message = transport.sendMail.mock.calls[0][0];
    expect(message).toMatchObject({
      from: { name: "Block 57", address: "noreply@test.com" },
      to: "ama@example.com",
      subject: "Confirm your Block 57 account",
    });
    expect(message.replyTo).toBeUndefined();
    expect(message.html).not.toContain("Buytly");
  });

  it("sends SendGrid mail from the site name", async () => {
    env.EMAIL_PROVIDER = "sendgrid";

    await inSite(block57Site, () =>
      emailService.sendEmailVerification("ama@example.com", verification),
    );

    expect(transport.sendMail).not.toHaveBeenCalled();
    expect(transport.sgSend).toHaveBeenCalledTimes(1);
    expect(transport.sgSend.mock.calls[0][0]).toMatchObject({
      from: { email: "noreply@test.com", name: "Block 57" },
      subject: "Confirm your Block 57 account",
    });
  });

  it("keeps Buytly as sender on Buytly and without a request site", async () => {
    await inSite(buytlySite, () =>
      emailService.sendWelcome("jane@example.com", { name: "Jane" }),
    );
    await emailService.sendWelcome("jane@example.com", { name: "Jane" });

    const [onBuytly, withoutSite] = transport.sendMail.mock.calls.map(
      ([message]) => message,
    );
    for (const message of [onBuytly, withoutSite]) {
      expect(message.from).toEqual({
        name: "Buytly",
        address: "noreply@test.com",
      });
      expect(message.subject).toBe("Welcome to Buytly");
    }
  });

  it("sets the auto-reply Reply-To to the site's support email", async () => {
    await inSite(block57Site, () =>
      emailService.sendContactAutoReply("ama@example.com", { name: "Ama" }),
    );

    expect(transport.sendMail.mock.calls[0][0]).toMatchObject({
      from: { name: "Block 57", address: "noreply@test.com" },
      replyTo: "info@block-57.com",
      subject: "We received your message — Block 57",
    });
  });

  it("omits the auto-reply Reply-To when the site has no support email", async () => {
    await inSite({ ...block57Site, branding: { siteDisplayName: "X" } }, () =>
      emailService.sendContactAutoReply("ama@example.com", { name: "Ama" }),
    );

    expect(transport.sendMail.mock.calls[0][0].replyTo).toBeUndefined();
  });

  it("keeps the submitter as Reply-To on the inbox email", async () => {
    await inSite(block57Site, () =>
      emailService.sendContactInquiry("info@block-57.com", {
        fullName: "Ama Mensah",
        email: "ama@example.com",
        message: "Please send me pricing.",
      }),
    );

    expect(transport.sendMail.mock.calls[0][0]).toMatchObject({
      from: { name: "Block 57", address: "noreply@test.com" },
      to: "info@block-57.com",
      replyTo: "ama@example.com",
      subject: "Block 57 contact form — Ama Mensah",
    });
  });
});

const PASSWORD = "password123";

const register = (app, slug, email) =>
  api(app, slug).post("/api/v1/auth/register").send({
    email,
    password: PASSWORD,
    confirmPassword: PASSWORD,
    firstName: "Ama",
    role: "buyer",
  });

const tokenFrom = (url) => new URL(url).searchParams.get("token");

describe.skipIf(!mongoAvailable)("per-site auth links", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    [SITE_SLUG.BUYTLY, "http://localhost:3000"],
    [SITE_SLUG.BUILDWISE, "http://localhost:3001"],
    [SITE_SLUG.BLOCK57, "http://localhost:3002"],
  ])("registration on %s sends a verify link to %s", async (slug, base) => {
    const app = await getApp();
    const spy = vi.spyOn(emailService, "sendEmailVerification");

    const res = await register(app, slug, `verify-${slug}@example.com`);
    expect(res.status, res.body?.message).toBe(201);

    await vi.waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
    const { verifyUrl } = spy.mock.calls[0][1];
    expect(verifyUrl).toMatch(
      new RegExp(`^${base}/verify-email\\?token=[a-f0-9]{64}$`),
    );
  });

  it("renders a Block 57 verification email whose link verifies on Block 57", async () => {
    const app = await getApp();
    const spy = vi.spyOn(emailTemplates, "emailVerification");

    const res = await register(
      app,
      SITE_SLUG.BLOCK57,
      "ama-verify@example.com",
    );
    expect(res.status, res.body?.message).toBe(201);

    await vi.waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
    const rendered = spy.mock.results[0].value;
    expect(rendered.subject).toBe("Confirm your Block 57 account");
    expect(rendered.html).not.toContain("Buytly");
    expect(rendered.text).toContain(
      "http://localhost:3002/verify-email?token=",
    );

    const token = tokenFrom(spy.mock.calls[0][0].verifyUrl);
    const verified = await api(app, SITE_SLUG.BLOCK57)
      .post("/api/v1/auth/verify-email")
      .send({ token });
    expect(verified.status, verified.body?.message).toBe(200);
    expect(verified.body.data.user.isEmailVerified).toBe(true);
  });

  it.each([
    [SITE_SLUG.BUYTLY, "http://localhost:3000"],
    [SITE_SLUG.BLOCK57, "http://localhost:3002"],
  ])(
    "forgot-password on %s sends a reset link to %s that resets there",
    async (slug, base) => {
      const app = await getApp();
      const email = `reset-${slug}@example.com`;
      expect((await register(app, slug, email)).status).toBe(201);
      const spy = vi.spyOn(emailService, "sendPasswordReset");

      const res = await api(app, slug)
        .post("/api/v1/auth/forgot-password")
        .send({ email });
      expect(res.status).toBe(200);

      expect(spy).toHaveBeenCalledTimes(1);
      const { resetUrl } = spy.mock.calls[0][1];
      expect(resetUrl).toMatch(
        new RegExp(`^${base}/reset-password\\?token=[a-f0-9]{64}$`),
      );

      const reset = await api(app, slug)
        .post("/api/v1/auth/reset-password")
        .send({ token: tokenFrom(resetUrl), password: "newpassword123" });
      expect(reset.status, reset.body?.message).toBe(200);

      const login = await api(app, slug)
        .post("/api/v1/auth/login")
        .send({ email, password: "newpassword123" });
      expect(login.status).toBe(200);
    },
  );
});

describe.skipIf(!mongoAvailable)("per-site notifications", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("names Block 57 in the welcome notification and email", async () => {
    const app = await getApp();
    const spy = vi.spyOn(emailTemplates, "welcome");

    const res = await register(
      app,
      SITE_SLUG.BLOCK57,
      "ama-welcome@example.com",
    );
    expect(res.status).toBe(201);
    const userId = res.body.data.user.id;

    await vi.waitFor(async () => {
      const notification = await Notification.findOne({ userId }).lean();
      expect(notification?.title).toBe("Welcome to Block 57");
    });
    await vi.waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
    expect(spy.mock.results[0].value.subject).toBe("Welcome to Block 57");
  });

  it("links a Block 57 user's notification email to the Block 57 site", async () => {
    const app = await getApp();
    const res = await register(
      app,
      SITE_SLUG.BLOCK57,
      "ama-notify@example.com",
    );
    expect(res.status).toBe(201);
    const userId = res.body.data.user.id;
    const site = await Site.findOne({ slug: SITE_SLUG.BLOCK57 }).lean();
    const sendSpy = vi.spyOn(emailService, "send");
    const templateSpy = vi.spyOn(emailTemplates, "passwordChanged");

    await inSite(site, () =>
      notificationService.notifyFromEvent("auth.password_changed", {
        userId,
        context: { name: "Ama" },
      }),
    );

    await vi.waitFor(() => expect(templateSpy).toHaveBeenCalledTimes(1));
    const call = sendSpy.mock.calls.find(
      ([, template]) => template === "passwordChanged",
    );
    expect(call[2].ctaUrl).toBe("http://localhost:3002/dashboard-my-profile");

    const rendered = templateSpy.mock.results[0].value;
    expect(rendered.subject).toBe("Your Block 57 password was changed");
    expect(rendered.html).toContain(
      "http://localhost:3002/dashboard-my-profile",
    );
    expect(rendered.html).not.toContain("Buytly");
  });
});
