import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import mongoose from "mongoose";
import { mongoAvailable } from "./setup.js";
import { api } from "./helpers/http.js";
import { emailService } from "../src/services/email.service.js";
import { Inquiry } from "../src/modules/inquiries/inquiry.model.js";
import { Property } from "../src/modules/properties/property.model.js";
import { Site } from "../src/modules/sites/site.model.js";
import { User } from "../src/modules/users/user.model.js";
import {
  PLATFORM_PERMISSIONS,
  SITE_SLUG,
} from "../src/modules/sites/site.constants.js";
import { resolveSitePublicBaseUrl } from "../src/modules/sites/sitePublicUrl.js";

const SUCCESS_MESSAGE = "Your message has been sent.";

const getApp = async () => {
  const { default: app } = await import("../src/app.js");
  return app;
};

const getSite = (slug) => Site.findOne({ slug }).lean();

const contactPayload = (overrides = {}) => ({
  firstName: "Ama",
  lastName: "Mensah",
  email: "ama@example.com",
  message: "I would like to arrange a viewing of the penthouse.",
  ...overrides,
});

// Always in the future, whatever the server date is.
const TOUR_DATE = `${new Date().getFullYear() + 1}-06-15`;

const createUnit = (siteId, overrides = {}) =>
  Property.create({
    siteId,
    title: "A-101",
    slug: `a-101-${new mongoose.Types.ObjectId()}`,
    description: "Two-bedroom residence on the first floor of Block A.",
    type: "apartment",
    projectId: new mongoose.Types.ObjectId(),
    price: 450000,
    location: {
      type: "Point",
      coordinates: [-0.17, 5.58],
      city: "Accra",
      country: "Ghana",
    },
    ownerId: new mongoose.Types.ObjectId(),
    status: "active",
    ...overrides,
  });

const registerOnSite = (app, slug, email, role = "buyer") =>
  api(app, slug).post("/api/v1/auth/register").send({
    email,
    password: "password123",
    confirmPassword: "password123",
    firstName: "Test",
    role,
  });

const loginOnSite = async (app, slug, email) => {
  const res = await api(app, slug)
    .post("/api/v1/auth/login")
    .send({ email, password: "password123" });
  expect(res.status, res.body?.message).toBe(200);
  return res.body.data.accessToken;
};

/** Registers a user on `slug`, promotes them to admin and returns a token. */
const loginAsSiteAdmin = async (app, slug, email, extra = {}) => {
  const registered = await registerOnSite(app, slug, email);
  expect(registered.status, registered.body?.message).toBe(201);
  const site = await getSite(slug);
  await User.findOneAndUpdate(
    { siteId: site._id, email },
    { role: "admin", ...extra },
  );
  return loginOnSite(app, slug, email);
};

describe.skipIf(!mongoAvailable)("POST /api/v1/contact (stored inquiries)", () => {
  let inquirySpy;
  let autoReplySpy;
  let consoleErrorSpy;

  beforeEach(() => {
    inquirySpy = vi.spyOn(emailService, "sendContactInquiry");
    autoReplySpy = vi.spyOn(emailService, "sendContactAutoReply");
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("stores the inquiry with the new fields and emails the default inbox on Buytly", async () => {
    const app = await getApp();
    const site = await getSite(SITE_SLUG.BUYTLY);
    const baseUrl = resolveSitePublicBaseUrl(site);

    const res = await api(app)
      .post("/api/v1/contact")
      .send(
        contactPayload({
          phone: "+233 244 777 772",
          residenceType: "Penthouse",
          unitLabel: "PH-1",
          pagePath: "/contact",
        }),
      );

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      success: true,
      message: SUCCESS_MESSAGE,
      data: null,
    });

    const stored = await Inquiry.find({}).lean();
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({
      firstName: "Ama",
      lastName: "Mensah",
      fullName: "Ama Mensah",
      email: "ama@example.com",
      phone: "+233 244 777 772",
      residenceType: "Penthouse",
      unitId: null,
      unitLabel: "PH-1",
      message: "I would like to arrange a viewing of the penthouse.",
      topic: "inquiry",
      preferredDate: "",
      preferredTime: "",
      pagePath: "/contact",
      sourceUrl: `${baseUrl}/contact`,
      status: "new",
      emailDelivered: true,
    });
    expect(String(stored[0].siteId)).toBe(String(site._id));
    expect(stored[0].createdAt).toBeInstanceOf(Date);

    // Buytly has no branding.contactInboxEmail, so CONTACT_INBOX_EMAIL is used.
    expect(inquirySpy).toHaveBeenCalledTimes(1);
    expect(inquirySpy).toHaveBeenCalledWith(
      process.env.CONTACT_INBOX_EMAIL,
      expect.objectContaining({
        fullName: "Ama Mensah",
        email: "ama@example.com",
        phone: "+233 244 777 772",
        residenceType: "Penthouse",
        unitLabel: "PH-1",
        topic: "inquiry",
        sourceUrl: `${baseUrl}/contact`,
      }),
    );
    expect(autoReplySpy).toHaveBeenCalledWith("ama@example.com", {
      name: "Ama",
      topic: "inquiry",
    });
  });

  it("routes Block 57 inquiries to the site's branding.contactInboxEmail", async () => {
    const app = await getApp();
    const site = await getSite(SITE_SLUG.BLOCK57);
    expect(site.branding.contactInboxEmail).toBe("info@block-57.com");

    const res = await api(app, SITE_SLUG.BLOCK57)
      .post("/api/v1/contact")
      .send(contactPayload({ pagePath: "/inquire/" }));

    expect(res.status).toBe(201);
    expect(inquirySpy).toHaveBeenCalledWith(
      "info@block-57.com",
      expect.objectContaining({
        sourceUrl: `${resolveSitePublicBaseUrl(site)}/inquire/`,
      }),
    );

    const stored = await Inquiry.findOne({}).lean();
    expect(String(stored.siteId)).toBe(String(site._id));
    expect(stored.sourceUrl).toBe("http://localhost:3002/inquire/");
  });

  it("falls back to CONTACT_INBOX_EMAIL when the site inbox is blank", async () => {
    const app = await getApp();
    await Site.updateOne(
      { slug: SITE_SLUG.BLOCK57 },
      { $set: { "branding.contactInboxEmail": "  " } },
    );
    const { siteService } = await import(
      "../src/modules/sites/site.service.js"
    );
    siteService.invalidateCache();

    const res = await api(app, SITE_SLUG.BLOCK57)
      .post("/api/v1/contact")
      .send(contactPayload());

    expect(res.status).toBe(201);
    expect(inquirySpy).toHaveBeenCalledWith(
      process.env.CONTACT_INBOX_EMAIL,
      expect.any(Object),
    );
  });

  it("uses the site base URL as sourceUrl when no pagePath is sent", async () => {
    const app = await getApp();
    const site = await getSite(SITE_SLUG.BUYTLY);

    const res = await api(app).post("/api/v1/contact").send(contactPayload());

    expect(res.status).toBe(201);
    const stored = await Inquiry.findOne({}).lean();
    expect(stored.sourceUrl).toBe(resolveSitePublicBaseUrl(site));
    expect(stored.pagePath).toBe("");
    expect(stored.phone).toBe("");
  });

  it("keeps the inquiry and still returns 201 when the inbox email fails", async () => {
    const app = await getApp();
    inquirySpy.mockRejectedValueOnce(new Error("SMTP unavailable"));

    const res = await api(app, SITE_SLUG.BLOCK57)
      .post("/api/v1/contact")
      .send(contactPayload());

    expect(res.status).toBe(201);
    expect(res.body.message).toBe(SUCCESS_MESSAGE);

    const stored = await Inquiry.find({}).lean();
    expect(stored).toHaveLength(1);
    expect(stored[0].emailDelivered).toBe(false);
    expect(autoReplySpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Contact inquiry email failed:",
      "SMTP unavailable",
    );
  });

  it("marks the inquiry delivered when only the auto-reply fails", async () => {
    const app = await getApp();
    autoReplySpy.mockRejectedValueOnce(new Error("Mailbox full"));

    const res = await api(app).post("/api/v1/contact").send(contactPayload());

    expect(res.status).toBe(201);
    const stored = await Inquiry.findOne({}).lean();
    expect(stored.emailDelivered).toBe(true);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Contact auto-reply email failed:",
      "Mailbox full",
    );
  });

  it.each([
    ["a URL", "https://spam.example.com"],
    ["whitespace only", "   "],
    ["an over-long value", `https://${"x".repeat(300)}.example.com`],
  ])("answers a filled honeypot (%s) like a success without storing or emailing", async (_label, website) => {
    const app = await getApp();

    const res = await api(app, SITE_SLUG.BLOCK57)
      .post("/api/v1/contact")
      .send(contactPayload({ website }));

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      success: true,
      message: SUCCESS_MESSAGE,
      data: null,
    });
    expect(await Inquiry.countDocuments()).toBe(0);
    expect(inquirySpy).not.toHaveBeenCalled();
    expect(autoReplySpy).not.toHaveBeenCalled();
  });

  it("stores an empty honeypot submission normally", async () => {
    const app = await getApp();

    const res = await api(app)
      .post("/api/v1/contact")
      .send(contactPayload({ website: "" }));

    expect(res.status).toBe(201);
    expect(await Inquiry.countDocuments()).toBe(1);
  });

  it("keeps a unitId that belongs to the current site", async () => {
    const app = await getApp();
    const site = await getSite(SITE_SLUG.BLOCK57);
    const unit = await createUnit(site._id);

    const res = await api(app, SITE_SLUG.BLOCK57)
      .post("/api/v1/contact")
      .send(contactPayload({ unitId: String(unit._id), unitLabel: "A-101" }));

    expect(res.status).toBe(201);
    const stored = await Inquiry.findOne({}).lean();
    expect(String(stored.unitId)).toBe(String(unit._id));
    expect(stored.unitLabel).toBe("A-101");
  });

  it("ignores a unitId from another site or an unknown unit", async () => {
    const app = await getApp();
    const buytly = await getSite(SITE_SLUG.BUYTLY);
    const foreignUnit = await createUnit(buytly._id);

    const foreign = await api(app, SITE_SLUG.BLOCK57)
      .post("/api/v1/contact")
      .send(
        contactPayload({ unitId: String(foreignUnit._id), unitLabel: "A-101" }),
      );
    const unknown = await api(app, SITE_SLUG.BLOCK57)
      .post("/api/v1/contact")
      .send(
        contactPayload({ unitId: String(new mongoose.Types.ObjectId()) }),
      );

    expect(foreign.status).toBe(201);
    expect(unknown.status).toBe(201);
    const stored = await Inquiry.find({}).lean();
    expect(stored).toHaveLength(2);
    expect(stored.every((inquiry) => inquiry.unitId === null)).toBe(true);
    expect(stored.map((inquiry) => inquiry.unitLabel)).toContain("A-101");
  });

  it.each([
    ["a missing email", { email: undefined }],
    ["an invalid unitId", { unitId: "not-an-id" }],
    ["a pagePath without a leading slash", { pagePath: "inquire" }],
    ["a too long phone", { phone: "1".repeat(41) }],
    ["an unknown topic", { topic: "newsletter" }],
    ["a malformed preferredDate", { preferredDate: "15/06/2027" }],
    [
      "an impossible preferredDate",
      { preferredDate: TOUR_DATE.replace("-06-15", "-02-30") },
    ],
    ["a past preferredDate", { preferredDate: "2020-01-01" }],
    ["a too long preferredTime", { preferredTime: "x".repeat(41) }],
  ])("returns 400 for %s and stores nothing", async (_label, overrides) => {
    const app = await getApp();

    const res = await api(app)
      .post("/api/v1/contact")
      .send(contactPayload(overrides));

    expect(res.status).toBe(400);
    expect(await Inquiry.countDocuments()).toBe(0);
    expect(inquirySpy).not.toHaveBeenCalled();
  });

  it("ignores client-sent siteId and status fields", async () => {
    const app = await getApp();
    const buytly = await getSite(SITE_SLUG.BUYTLY);
    const block57 = await getSite(SITE_SLUG.BLOCK57);

    const res = await api(app, SITE_SLUG.BLOCK57)
      .post("/api/v1/contact")
      .send(
        contactPayload({
          siteId: String(buytly._id),
          status: "closed",
          emailDelivered: true,
        }),
      );

    expect(res.status).toBe(201);
    const stored = await Inquiry.findOne({}).lean();
    expect(String(stored.siteId)).toBe(String(block57._id));
    expect(stored.status).toBe("new");
  });

  it("stores a nameless contact-form submission and emails it without a name", async () => {
    const app = await getApp();

    const res = await api(app, SITE_SLUG.BLOCK57)
      .post("/api/v1/contact")
      .send({
        email: "visitor@example.com",
        phone: "+233 20 000 0002",
        message: "Please call me back.",
        topic: "contact",
        pagePath: "/contact/",
        website: "",
      });

    expect(res.status).toBe(201);
    const stored = await Inquiry.findOne({}).lean();
    expect(stored).toMatchObject({
      firstName: "",
      lastName: "",
      fullName: "",
      email: "visitor@example.com",
      phone: "+233 20 000 0002",
      message: "Please call me back.",
      topic: "contact",
      preferredDate: "",
      preferredTime: "",
      pagePath: "/contact/",
      emailDelivered: true,
    });
    expect(inquirySpy).toHaveBeenCalledWith(
      "info@block-57.com",
      expect.objectContaining({
        fullName: "",
        email: "visitor@example.com",
        topic: "contact",
      }),
    );
    expect(autoReplySpy).toHaveBeenCalledWith("visitor@example.com", {
      name: "",
      topic: "contact",
    });
  });

  it("accepts an inquiry without a message", async () => {
    const app = await getApp();

    const res = await api(app, SITE_SLUG.BLOCK57)
      .post("/api/v1/contact")
      .send(contactPayload({ message: "", residenceType: "1 Bedroom" }));

    expect(res.status).toBe(201);
    const stored = await Inquiry.findOne({}).lean();
    expect(stored.message).toBe("");
    expect(stored.residenceType).toBe("1 Bedroom");
    expect(stored.topic).toBe("inquiry");
  });

  it.each([
    ["Ama Serwaa Mensah", "Ama", "Serwaa Mensah"],
    ["Kwame", "Kwame", ""],
  ])(
    "splits fullName %j on the first space",
    async (fullName, firstName, lastName) => {
      const app = await getApp();

      const res = await api(app, SITE_SLUG.BLOCK57)
        .post("/api/v1/contact")
        .send({ fullName: ` ${fullName} `, email: "ama@example.com" });

      expect(res.status).toBe(201);
      const stored = await Inquiry.findOne({}).lean();
      expect(stored).toMatchObject({ firstName, lastName, fullName });
      expect(inquirySpy).toHaveBeenCalledWith(
        "info@block-57.com",
        expect.objectContaining({ fullName }),
      );
      expect(autoReplySpy).toHaveBeenCalledWith(
        "ama@example.com",
        expect.objectContaining({ name: firstName }),
      );
    },
  );

  it("keeps explicit first and last names over fullName", async () => {
    const app = await getApp();

    const res = await api(app, SITE_SLUG.BLOCK57)
      .post("/api/v1/contact")
      .send(contactPayload({ lastName: "", fullName: "Ama Serwaa Mensah" }));

    expect(res.status).toBe(201);
    const stored = await Inquiry.findOne({}).lean();
    expect(stored).toMatchObject({
      firstName: "Ama",
      lastName: "",
      fullName: "Ama Serwaa Mensah",
    });
  });

  it("stores a schedule-a-tour request and passes the tour fields to both emails", async () => {
    const app = await getApp();

    const res = await api(app, SITE_SLUG.BLOCK57)
      .post("/api/v1/contact")
      .send({
        fullName: "Ama Mensah",
        email: "ama@example.com",
        phone: "+233 244 777 772",
        topic: "tour",
        preferredDate: TOUR_DATE,
        preferredTime: " 9:00 AM ",
        message: "",
        pagePath: "/",
      });

    expect(res.status).toBe(201);
    const stored = await Inquiry.findOne({}).lean();
    expect(stored).toMatchObject({
      firstName: "Ama",
      lastName: "Mensah",
      fullName: "Ama Mensah",
      topic: "tour",
      preferredDate: TOUR_DATE,
      preferredTime: "9:00 AM",
      message: "",
      pagePath: "/",
    });
    expect(inquirySpy).toHaveBeenCalledWith(
      "info@block-57.com",
      expect.objectContaining({
        fullName: "Ama Mensah",
        topic: "tour",
        preferredDate: TOUR_DATE,
        preferredTime: "9:00 AM",
      }),
    );
    expect(autoReplySpy).toHaveBeenCalledWith("ama@example.com", {
      name: "Ama",
      topic: "tour",
      preferredDate: TOUR_DATE,
      preferredTime: "9:00 AM",
    });
  });

  it("explains an invalid preferredDate in the validation errors", async () => {
    const app = await getApp();

    const res = await api(app, SITE_SLUG.BLOCK57)
      .post("/api/v1/contact")
      .send({
        email: "ama@example.com",
        topic: "tour",
        preferredDate: "2020-01-01",
      });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual([
      {
        field: "preferredDate",
        message: "preferredDate cannot be in the past",
      },
    ]);
    expect(await Inquiry.countDocuments()).toBe(0);
  });
});

describe.skipIf(!mongoAvailable)("admin inquiries API", () => {
  let buytlySite;
  let block57Site;

  beforeEach(async () => {
    buytlySite = await getSite(SITE_SLUG.BUYTLY);
    block57Site = await getSite(SITE_SLUG.BLOCK57);
  });

  const seedInquiries = async () => {
    const base = {
      lastName: "Visitor",
      message: "Please share the availability list.",
    };
    // Explicit timestamps keep the newest-first ordering deterministic.
    const at = (minutes) => new Date(Date.UTC(2026, 9, 1, 9, minutes));
    const [buytlyNew, block57New, block57Contacted, block57Closed] =
      await Inquiry.create([
        {
          ...base,
          siteId: buytlySite._id,
          firstName: "Buytly",
          createdAt: at(0),
          email: "buyer@buytly.example.com",
        },
        {
          ...base,
          siteId: block57Site._id,
          firstName: "Kofi",
          createdAt: at(1),
          email: "kofi@example.com",
          phone: "+233 20 000 0001",
          message: "Interested in the Urban Villa (price?) layout.",
        },
        {
          ...base,
          siteId: block57Site._id,
          firstName: "Efua",
          createdAt: at(2),
          email: "EFUA@example.com",
          status: "contacted",
        },
        {
          ...base,
          siteId: block57Site._id,
          firstName: "Yaw",
          createdAt: at(3),
          email: "yaw@example.com",
          status: "closed",
        },
      ]);
    return { buytlyNew, block57New, block57Contacted, block57Closed };
  };

  it("requires authentication", async () => {
    const app = await getApp();
    const { block57New } = await seedInquiries();

    const list = await api(app, SITE_SLUG.BLOCK57).get(
      "/api/v1/admin/inquiries",
    );
    const patch = await api(app, SITE_SLUG.BLOCK57)
      .patch(`/api/v1/admin/inquiries/${block57New._id}`)
      .send({ status: "closed" });

    expect(list.status).toBe(401);
    expect(patch.status).toBe(401);
  });

  it("forbids non-admin users", async () => {
    const app = await getApp();
    const { block57New } = await seedInquiries();
    const email = "buyer@block57.example.com";
    await registerOnSite(app, SITE_SLUG.BLOCK57, email);
    const token = await loginOnSite(app, SITE_SLUG.BLOCK57, email);

    const list = await api(app, SITE_SLUG.BLOCK57)
      .get("/api/v1/admin/inquiries")
      .set("Authorization", `Bearer ${token}`);
    const patch = await api(app, SITE_SLUG.BLOCK57)
      .patch(`/api/v1/admin/inquiries/${block57New._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "closed" });

    expect(list.status).toBe(403);
    expect(patch.status).toBe(403);
    const unchanged = await Inquiry.findById(block57New._id).lean();
    expect(unchanged.status).toBe("new");
  });

  it("lists only the current site's inquiries, newest first, with pagination", async () => {
    const app = await getApp();
    await seedInquiries();
    const token = await loginAsSiteAdmin(
      app,
      SITE_SLUG.BLOCK57,
      "admin@block-57.example.com",
    );

    const res = await api(app, SITE_SLUG.BLOCK57)
      .get("/api/v1/admin/inquiries")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.pagination).toEqual({
      page: 1,
      limit: 20,
      total: 3,
      totalPages: 1,
    });
    expect(res.body.data.map((inquiry) => inquiry.firstName)).toEqual([
      "Yaw",
      "Efua",
      "Kofi",
    ]);
    expect(
      res.body.data.every(
        (inquiry) => inquiry.siteId === String(block57Site._id),
      ),
    ).toBe(true);

    const paged = await api(app, SITE_SLUG.BLOCK57)
      .get("/api/v1/admin/inquiries?page=2&limit=2")
      .set("Authorization", `Bearer ${token}`);

    expect(paged.status).toBe(200);
    expect(paged.body.pagination).toEqual({
      page: 2,
      limit: 2,
      total: 3,
      totalPages: 2,
    });
    expect(paged.body.data.map((inquiry) => inquiry.firstName)).toEqual([
      "Kofi",
    ]);
  });

  it("keeps Buytly platform admins scoped to Buytly inquiries", async () => {
    const app = await getApp();
    const { block57New } = await seedInquiries();
    const token = await loginAsSiteAdmin(
      app,
      SITE_SLUG.BUYTLY,
      "platform-admin@buytly.example.com",
      {
        platformPermissions: [
          PLATFORM_PERMISSIONS.CROSS_SITE_READ,
          PLATFORM_PERMISSIONS.CROSS_SITE_MODERATE,
        ],
      },
    );

    const list = await api(app, SITE_SLUG.BUYTLY)
      .get(`/api/v1/admin/inquiries?siteId=${block57Site._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(list.status).toBe(200);
    expect(list.body.pagination.total).toBe(1);
    expect(list.body.data[0].firstName).toBe("Buytly");

    const patch = await api(app, SITE_SLUG.BUYTLY)
      .patch(`/api/v1/admin/inquiries/${block57New._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "closed" });

    expect(patch.status).toBe(404);
    const unchanged = await Inquiry.findById(block57New._id).lean();
    expect(unchanged.status).toBe("new");

    // A Buytly token is not valid on the Block 57 site at all.
    const crossSite = await api(app, SITE_SLUG.BLOCK57)
      .get("/api/v1/admin/inquiries")
      .set("Authorization", `Bearer ${token}`);
    expect(crossSite.status).toBe(401);
  });

  it("filters by status and by escaped, case-insensitive search", async () => {
    const app = await getApp();
    await seedInquiries();
    const token = await loginAsSiteAdmin(
      app,
      SITE_SLUG.BLOCK57,
      "admin@block-57.example.com",
    );
    const list = (query) =>
      api(app, SITE_SLUG.BLOCK57)
        .get(`/api/v1/admin/inquiries${query}`)
        .set("Authorization", `Bearer ${token}`);

    const contacted = await list("?status=contacted");
    expect(contacted.status).toBe(200);
    expect(contacted.body.data.map((inquiry) => inquiry.firstName)).toEqual([
      "Efua",
    ]);

    const byEmail = await list("?search=efua%40EXAMPLE");
    expect(byEmail.body.data.map((inquiry) => inquiry.firstName)).toEqual([
      "Efua",
    ]);

    const byPhone = await list(`?search=${encodeURIComponent("+233 20")}`);
    expect(byPhone.body.data.map((inquiry) => inquiry.firstName)).toEqual([
      "Kofi",
    ]);

    // Regex metacharacters are matched literally.
    const byMessage = await list(`?search=${encodeURIComponent("(price?)")}`);
    expect(byMessage.status).toBe(200);
    expect(byMessage.body.data.map((inquiry) => inquiry.firstName)).toEqual([
      "Kofi",
    ]);

    const combined = await list("?status=closed&search=kofi");
    expect(combined.body.data).toEqual([]);
    expect(combined.body.pagination.total).toBe(0);

    // Buytly's inquiry never matches on the Block 57 site.
    const otherSite = await list("?search=buytly");
    expect(otherSite.body.data).toEqual([]);
  });

  it("searches the full name and returns the new fields, with defaults for older inquiries", async () => {
    const app = await getApp();
    await Inquiry.create({
      siteId: block57Site._id,
      firstName: "Ama",
      lastName: "Serwaa Mensah",
      fullName: "Ama Serwaa Mensah",
      email: "ama@example.com",
      topic: "tour",
      preferredDate: TOUR_DATE,
      preferredTime: "9:00 AM",
      createdAt: new Date(Date.UTC(2026, 9, 2, 9, 0)),
    });
    // Stored before fullName, topic and the tour fields existed (no defaults).
    const createdAt = new Date(Date.UTC(2026, 9, 1, 9, 0));
    const { insertedId: legacyId } = await Inquiry.collection.insertOne({
      siteId: block57Site._id,
      firstName: "Kojo",
      lastName: "Boateng",
      email: "kojo@example.com",
      message: "Please share the availability list.",
      status: "new",
      emailDelivered: true,
      createdAt,
      updatedAt: createdAt,
    });
    const token = await loginAsSiteAdmin(
      app,
      SITE_SLUG.BLOCK57,
      "admin@block-57.example.com",
    );
    const list = (query) =>
      api(app, SITE_SLUG.BLOCK57)
        .get(`/api/v1/admin/inquiries${query}`)
        .set("Authorization", `Bearer ${token}`);

    const all = await list("");
    expect(all.status).toBe(200);
    expect(all.body.data).toEqual([
      expect.objectContaining({
        firstName: "Ama",
        fullName: "Ama Serwaa Mensah",
        message: "",
        topic: "tour",
        preferredDate: TOUR_DATE,
        preferredTime: "9:00 AM",
      }),
      expect.objectContaining({
        firstName: "Kojo",
        fullName: "Kojo Boateng",
        topic: "inquiry",
        preferredDate: "",
        preferredTime: "",
      }),
    ]);

    // "ama serwaa" spans first and last name, so only fullName matches it.
    const byFullName = await list(
      `?search=${encodeURIComponent("ama serwaa")}`,
    );
    expect(byFullName.body.data.map((inquiry) => inquiry.email)).toEqual([
      "ama@example.com",
    ]);

    const patched = await api(app, SITE_SLUG.BLOCK57)
      .patch(`/api/v1/admin/inquiries/${legacyId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "contacted" });
    expect(patched.status).toBe(200);
    expect(patched.body.data).toMatchObject({
      status: "contacted",
      fullName: "Kojo Boateng",
      topic: "inquiry",
      preferredDate: "",
      preferredTime: "",
    });
  });

  it("returns 400 for invalid list queries", async () => {
    const app = await getApp();
    const token = await loginAsSiteAdmin(
      app,
      SITE_SLUG.BLOCK57,
      "admin@block-57.example.com",
    );

    for (const query of ["?status=archived", "?limit=101", "?page=0"]) {
      const res = await api(app, SITE_SLUG.BLOCK57)
        .get(`/api/v1/admin/inquiries${query}`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status, query).toBe(400);
    }
  });

  it("updates the status of an inquiry on the current site", async () => {
    const app = await getApp();
    const { block57New } = await seedInquiries();
    const token = await loginAsSiteAdmin(
      app,
      SITE_SLUG.BLOCK57,
      "admin@block-57.example.com",
    );

    const res = await api(app, SITE_SLUG.BLOCK57)
      .patch(`/api/v1/admin/inquiries/${block57New._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "contacted" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Inquiry status updated");
    expect(res.body.data).toMatchObject({
      _id: String(block57New._id),
      status: "contacted",
      firstName: "Kofi",
    });
    const stored = await Inquiry.findById(block57New._id).lean();
    expect(stored.status).toBe("contacted");
  });

  it("returns 404 for inquiries of another site or unknown ids", async () => {
    const app = await getApp();
    const { buytlyNew } = await seedInquiries();
    const token = await loginAsSiteAdmin(
      app,
      SITE_SLUG.BLOCK57,
      "admin@block-57.example.com",
    );

    const foreign = await api(app, SITE_SLUG.BLOCK57)
      .patch(`/api/v1/admin/inquiries/${buytlyNew._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "closed" });
    const unknown = await api(app, SITE_SLUG.BLOCK57)
      .patch(`/api/v1/admin/inquiries/${new mongoose.Types.ObjectId()}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "closed" });

    expect(foreign.status).toBe(404);
    expect(unknown.status).toBe(404);
    const unchanged = await Inquiry.findById(buytlyNew._id).lean();
    expect(unchanged.status).toBe("new");
  });

  it("returns 400 for an invalid status or id", async () => {
    const app = await getApp();
    const { block57New } = await seedInquiries();
    const token = await loginAsSiteAdmin(
      app,
      SITE_SLUG.BLOCK57,
      "admin@block-57.example.com",
    );

    const badStatus = await api(app, SITE_SLUG.BLOCK57)
      .patch(`/api/v1/admin/inquiries/${block57New._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "spam" });
    const missingStatus = await api(app, SITE_SLUG.BLOCK57)
      .patch(`/api/v1/admin/inquiries/${block57New._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({});
    const badId = await api(app, SITE_SLUG.BLOCK57)
      .patch("/api/v1/admin/inquiries/not-an-id")
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "closed" });

    expect(badStatus.status).toBe(400);
    expect(missingStatus.status).toBe(400);
    expect(badId.status).toBe(400);
  });
});
