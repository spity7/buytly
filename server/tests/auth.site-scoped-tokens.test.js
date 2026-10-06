import { describe, it, expect } from "vitest";
import { api } from "./helpers/http.js";
import { mongoAvailable } from "./setup.js";
import { SITE_SLUG } from "../src/modules/sites/site.constants.js";
import { Site } from "../src/modules/sites/site.model.js";
import { User } from "../src/modules/users/user.model.js";
import {
  generateEmailVerificationToken,
  generatePasswordResetToken,
} from "../src/services/token.service.js";

const { BLOCK57, BUYTLY } = SITE_SLUG;
const PASSWORD = "password123";
const NEW_PASSWORD = "newpassword123";

const getApp = async () => {
  const { default: app } = await import("../src/app.js");
  return app;
};

const register = async (app, slug, email) => {
  const res = await api(app, slug).post("/api/v1/auth/register").send({
    email,
    password: PASSWORD,
    confirmPassword: PASSWORD,
    firstName: "Ama",
    role: "buyer",
  });
  expect(res.status, res.body?.message).toBe(201);
};

const findUser = async (slug, email, select = "") => {
  const site = await Site.findOne({ slug }).lean();
  return User.findOne({ email, siteId: site._id }).select(select);
};

/** Stores a fresh verification token on the user and returns the plain token. */
const issueVerificationToken = async (slug, email) => {
  const user = await findUser(slug, email);
  const { token, hashed, expires } = generateEmailVerificationToken();
  user.emailVerificationToken = hashed;
  user.emailVerificationExpires = expires;
  await user.save();
  return token;
};

const issueResetToken = async (slug, email) => {
  const user = await findUser(slug, email);
  const { token, hashed, expires } = generatePasswordResetToken();
  user.passwordResetToken = hashed;
  user.passwordResetExpires = expires;
  await user.save();
  return token;
};

describe.skipIf(!mongoAvailable)("verify/reset tokens are scoped to the issuing site", () => {
  it("a Block 57 verification token does not verify on Buytly but does on Block 57", async () => {
    const app = await getApp();
    const email = "scoped-verify@example.com";
    await register(app, BLOCK57, email);
    const token = await issueVerificationToken(BLOCK57, email);

    const onBuytly = await api(app, BUYTLY)
      .post("/api/v1/auth/verify-email")
      .send({ token });
    expect(onBuytly.status).toBe(400);
    expect(onBuytly.body.message).toMatch(/invalid or expired/i);

    const untouched = await findUser(
      BLOCK57,
      email,
      "+emailVerificationToken",
    );
    expect(untouched.isEmailVerified).toBe(false);
    expect(untouched.emailVerificationToken).toBeTruthy();

    const onBlock57 = await api(app, BLOCK57)
      .post("/api/v1/auth/verify-email")
      .send({ token });
    expect(onBlock57.status, onBlock57.body?.message).toBe(200);
    expect(onBlock57.body.data.user.isEmailVerified).toBe(true);
  });

  it("a Block 57 reset token does not reset on Buytly but does on Block 57", async () => {
    const app = await getApp();
    const email = "scoped-reset@example.com";
    await register(app, BLOCK57, email);
    const token = await issueResetToken(BLOCK57, email);

    const onBuytly = await api(app, BUYTLY)
      .post("/api/v1/auth/reset-password")
      .send({ token, password: NEW_PASSWORD });
    expect(onBuytly.status).toBe(400);
    expect(onBuytly.body.message).toMatch(/invalid or expired/i);

    // The old password still works: nothing changed on Block 57.
    await api(app, BLOCK57)
      .post("/api/v1/auth/login")
      .send({ email, password: PASSWORD })
      .expect(200);

    const onBlock57 = await api(app, BLOCK57)
      .post("/api/v1/auth/reset-password")
      .send({ token, password: NEW_PASSWORD });
    expect(onBlock57.status, onBlock57.body?.message).toBe(200);

    await api(app, BLOCK57)
      .post("/api/v1/auth/login")
      .send({ email, password: NEW_PASSWORD })
      .expect(200);
  });

  it("only touches the account on the request site when the same email exists on both", async () => {
    const app = await getApp();
    const email = "same-email@example.com";
    await register(app, BUYTLY, email);
    await register(app, BLOCK57, email);
    const token = await issueResetToken(BLOCK57, email);

    await api(app, BUYTLY)
      .post("/api/v1/auth/reset-password")
      .send({ token, password: NEW_PASSWORD })
      .expect(400);

    await api(app, BLOCK57)
      .post("/api/v1/auth/reset-password")
      .send({ token, password: NEW_PASSWORD })
      .expect(200);

    // Buytly account keeps its old password; Block 57 has the new one.
    await api(app, BUYTLY)
      .post("/api/v1/auth/login")
      .send({ email, password: PASSWORD })
      .expect(200);
    await api(app, BUYTLY)
      .post("/api/v1/auth/login")
      .send({ email, password: NEW_PASSWORD })
      .expect(401);
    await api(app, BLOCK57)
      .post("/api/v1/auth/login")
      .send({ email, password: NEW_PASSWORD })
      .expect(200);
  });
});
