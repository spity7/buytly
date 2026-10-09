import { afterEach, describe, it, expect } from "vitest";
import { mongoAvailable } from "./setup.js";
import { api, request } from "./helpers/http.js";
import { env } from "../src/config/env.js";
import { Site } from "../src/modules/sites/site.model.js";
import { siteService } from "../src/modules/sites/site.service.js";
import { SITE_SLUG } from "../src/modules/sites/site.constants.js";
import { resolveSitePublicBaseUrl } from "../src/modules/sites/sitePublicUrl.js";
import { AmenityCatalog } from "../src/modules/catalog/amenity.model.js";
import { User } from "../src/modules/users/user.model.js";
import { registerSchema } from "../src/modules/auth/auth.validation.js";
import { updateProfileSchema } from "../src/modules/users/user.validation.js";
import {
  DEFAULT_PHONE_COUNTRY_CODE,
  PHONE_COUNTRY_CODES,
  parseFullPhone,
} from "../src/shared/phone.js";

const getApp = async () => {
  const { default: app } = await import("../src/app.js");
  return app;
};

const block57Site = {
  slug: SITE_SLUG.BLOCK57,
  primaryDomain: "block-57.com",
  publicUrl: "https://block-57.com",
};

describe("Block 57 public base URL", () => {
  const originalOverride = env.SITE_PUBLIC_URL_BLOCK57;
  const originalNodeEnv = env.NODE_ENV;

  afterEach(() => {
    env.SITE_PUBLIC_URL_BLOCK57 = originalOverride;
    env.NODE_ENV = originalNodeEnv;
  });

  it("uses the local dev port 3002 in test/development", () => {
    env.SITE_PUBLIC_URL_BLOCK57 = undefined;
    expect(resolveSitePublicBaseUrl(block57Site)).toBe("http://localhost:3002");
  });

  it("honours SITE_PUBLIC_URL_BLOCK57 (trailing slash trimmed)", () => {
    env.SITE_PUBLIC_URL_BLOCK57 = "https://staging.block-57.com/";
    expect(resolveSitePublicBaseUrl(block57Site)).toBe(
      "https://staging.block-57.com",
    );
  });

  it("falls back to the stored publicUrl in production", () => {
    env.SITE_PUBLIC_URL_BLOCK57 = undefined;
    env.NODE_ENV = "production";
    expect(resolveSitePublicBaseUrl(block57Site)).toBe("https://block-57.com");
  });

  it("does not apply the Block 57 override to other sites", () => {
    env.SITE_PUBLIC_URL_BLOCK57 = "https://staging.block-57.com";
    expect(resolveSitePublicBaseUrl({ slug: SITE_SLUG.BUILDWISE })).toBe(
      "http://localhost:3001",
    );
  });
});

describe("Ghana (+233) phone numbers", () => {
  it("is a supported country code without changing the default", () => {
    expect(PHONE_COUNTRY_CODES).toContain("+233");
    expect(DEFAULT_PHONE_COUNTRY_CODE).toBe("+961");
  });

  it("parses a full +233 number into its parts", () => {
    expect(parseFullPhone("+233244777772")).toEqual({
      phoneCountryCode: "+233",
      phoneNumber: "244777772",
    });
  });

  it("is accepted by registration and profile validation", () => {
    const register = registerSchema.safeParse({
      email: "ghana@example.com",
      password: "password123",
      confirmPassword: "password123",
      phoneCountryCode: "+233",
      phoneNumber: "244777772",
    });
    expect(register.success).toBe(true);
    expect(register.data.phoneCountryCode).toBe("+233");

    const profile = updateProfileSchema.safeParse({
      phoneCountryCode: "+233",
      phoneNumber: "244777772",
    });
    expect(profile.success).toBe(true);
  });
});

describe.skipIf(!mongoAvailable)("Block 57 site registry", () => {
  it("seeds the block57 tenant with branding and features", async () => {
    const site = await Site.findOne({ slug: SITE_SLUG.BLOCK57 }).lean();

    expect(site).toBeTruthy();
    expect(site.kind).toBe("tenant");
    expect(site.name).toBe("Block 57");
    expect(site.primaryDomain).toBe("block-57.com");
    expect(site.domains).toEqual(["www.block-57.com"]);
    expect(site.publicUrl).toBe("https://block-57.com");
    expect(site.platformListingPolicy).toBe("optIn");
    expect(site.isActive).toBe(true);
    expect(site.branding).toMatchObject({
      siteDisplayName: "Block 57",
      supportEmail: "info@block-57.com",
      supportPhone: "+233244777772",
      supportPhoneDisplay: "+233 244 777 772",
      contactInboxEmail: "info@block-57.com",
    });
    expect(site.features).toEqual({ hidePublicPrices: true });
  });

  it("inserts the site on boot without overwriting existing edits", async () => {
    await Site.updateOne(
      { slug: SITE_SLUG.BLOCK57 },
      { $set: { "branding.supportEmail": "sales@block-57.com" } },
    );
    await siteService.ensureDefaultSites();

    const edited = await Site.findOne({ slug: SITE_SLUG.BLOCK57 }).lean();
    expect(edited.branding.supportEmail).toBe("sales@block-57.com");

    await Site.deleteOne({ slug: SITE_SLUG.BLOCK57 });
    await siteService.ensureDefaultSites();

    const recreated = await Site.findOne({ slug: SITE_SLUG.BLOCK57 }).lean();
    expect(recreated.branding.supportEmail).toBe("info@block-57.com");
    expect(await Site.countDocuments({ slug: SITE_SLUG.BLOCK57 })).toBe(1);
  });

  it("resolves X-Site-Slug: block57 and scopes catalog reads to it", async () => {
    const app = await getApp();
    const block57 = await Site.findOne({ slug: SITE_SLUG.BLOCK57 }).lean();
    const buytly = await Site.findOne({ slug: SITE_SLUG.BUYTLY }).lean();

    const res = await api(app, SITE_SLUG.BLOCK57).get(
      "/api/v1/catalog/amenities",
    );

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);

    const ids = res.body.data.map((item) => String(item.id));
    const block57Ids = (
      await AmenityCatalog.find({ siteId: block57._id }).select("_id").lean()
    ).map((doc) => String(doc._id));
    const buytlyIds = (
      await AmenityCatalog.find({ siteId: buytly._id }).select("_id").lean()
    ).map((doc) => String(doc._id));

    expect(ids.every((id) => block57Ids.includes(id))).toBe(true);
    expect(ids.some((id) => buytlyIds.includes(id))).toBe(false);
  });

  it("resolves the site from the block-57.com Origin and allows it via CORS", async () => {
    const app = await getApp();
    const block57 = await Site.findOne({ slug: SITE_SLUG.BLOCK57 }).lean();

    const res = await request(app)
      .get("/api/v1/catalog/amenities")
      .set("Origin", "https://www.block-57.com");

    expect(res.status).toBe(200);
    expect(res.headers["access-control-allow-origin"]).toBe(
      "https://www.block-57.com",
    );

    const first = await AmenityCatalog.findById(res.body.data[0].id).lean();
    expect(String(first.siteId)).toBe(String(block57._id));
  });

  it("still rejects an unknown X-Site-Slug with 400", async () => {
    const app = await getApp();
    const res = await api(app, "block58").get("/api/v1/catalog/amenities");

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("allows the Block 57 dev and production origins", async () => {
    const origins = await siteService.getCorsOrigins();

    expect(origins).toEqual(
      expect.arrayContaining([
        "http://localhost:3002",
        "http://127.0.0.1:3002",
        "https://block-57.com",
        "https://www.block-57.com",
      ]),
    );
  });

  it("registers a Block 57 account with a +233 phone number", async () => {
    const app = await getApp();
    const block57 = await Site.findOne({ slug: SITE_SLUG.BLOCK57 }).lean();
    const email = "ghana-buyer@example.com";

    const res = await api(app, SITE_SLUG.BLOCK57)
      .post("/api/v1/auth/register")
      .send({
        email,
        password: "password123",
        confirmPassword: "password123",
        firstName: "Kwame",
        phoneCountryCode: "+233",
        phoneNumber: "244777772",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.user.phoneCountryCode).toBe("+233");
    expect(res.body.data.user.phoneNumber).toBe("244777772");

    const user = await User.findOne({ siteId: block57._id, email }).lean();
    expect(user).toBeTruthy();
    expect(user.phone).toBe("+233244777772");

    const update = await api(app, SITE_SLUG.BLOCK57)
      .patch("/api/v1/users/me")
      .set("Authorization", `Bearer ${res.body.data.accessToken}`)
      .send({ phoneCountryCode: "+233", phoneNumber: "201234567" });

    expect(update.status).toBe(200);
    expect(update.body.data.phoneCountryCode).toBe("+233");
    expect(update.body.data.phoneNumber).toBe("201234567");
  });
});
