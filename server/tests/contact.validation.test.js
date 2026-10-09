import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { submitContactSchema } from "../src/modules/contact/contact.validation.js";

const basePayload = {
  firstName: "Jane",
  lastName: "Smith",
  email: "jane@example.com",
  message: "Hello, I need help with a listing.",
};

describe("submitContactSchema", () => {
  it("accepts valid payload", () => {
    const result = submitContactSchema.safeParse(basePayload);
    expect(result.success).toBe(true);
  });

  it("keeps the Buytly payload as sent and defaults the topic to inquiry", () => {
    const result = submitContactSchema.safeParse(basePayload);
    expect(result.data).toEqual({
      ...basePayload,
      topic: "inquiry",
      website: false,
    });
  });

  it("accepts a nameless payload without a message (Block 57 contact form)", () => {
    const result = submitContactSchema.safeParse({
      email: "jane@example.com",
      phone: "+233 244 777 772",
      topic: "contact",
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      email: "jane@example.com",
      phone: "+233 244 777 772",
      topic: "contact",
      website: false,
    });
  });

  it("treats blank names, fullName and message as not provided", () => {
    const result = submitContactSchema.safeParse({
      firstName: " ",
      lastName: "",
      fullName: "   ",
      email: "jane@example.com",
      message: " \n ",
      topic: "",
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      email: "jane@example.com",
      topic: "inquiry",
      website: false,
    });
  });

  it("accepts a short message and trims names", () => {
    const result = submitContactSchema.safeParse({
      firstName: " Jane ",
      fullName: "  Ama Serwaa Mensah ",
      email: "jane@example.com",
      message: " Hi ",
    });

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      firstName: "Jane",
      fullName: "Ama Serwaa Mensah",
      message: "Hi",
    });
  });

  it.each([
    ["missing", undefined],
    ["blank", "  "],
    ["invalid", "not-an-email"],
  ])("still requires a valid email (%s)", (_label, email) => {
    const result = submitContactSchema.safeParse({ ...basePayload, email });
    expect(result.success).toBe(false);
  });

  it("accepts every topic and trims the preferred time", () => {
    for (const topic of ["inquiry", "contact", "tour"]) {
      expect(
        submitContactSchema.safeParse({ ...basePayload, topic }).data?.topic,
      ).toBe(topic);
    }
    expect(
      submitContactSchema.safeParse({
        ...basePayload,
        preferredTime: " 9:00 AM ",
      }).data.preferredTime,
    ).toBe("9:00 AM");
  });

  it("accepts and trims the optional inquiry fields", () => {
    const result = submitContactSchema.safeParse({
      ...basePayload,
      phone: "  +233 244 777 772 ",
      residenceType: " Penthouse ",
      unitId: "507f1f77bcf86cd799439011",
      unitLabel: " A-101 ",
      pagePath: "/apartments/penthouse/",
      website: "",
    });

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      phone: "+233 244 777 772",
      residenceType: "Penthouse",
      unitId: "507f1f77bcf86cd799439011",
      unitLabel: "A-101",
      pagePath: "/apartments/penthouse/",
      website: false,
    });
  });

  it("treats blank optional fields as not provided", () => {
    const result = submitContactSchema.safeParse({
      ...basePayload,
      phone: "",
      unitId: "",
      pagePath: "  ",
    });

    expect(result.success).toBe(true);
    expect(result.data.phone).toBeUndefined();
    expect(result.data.unitId).toBeUndefined();
    expect(result.data.pagePath).toBeUndefined();
  });

  it("drops unknown keys", () => {
    const result = submitContactSchema.safeParse({
      ...basePayload,
      siteId: "507f1f77bcf86cd799439011",
      status: "closed",
    });

    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty("siteId");
    expect(result.data).not.toHaveProperty("status");
  });

  it.each([
    ["firstName", "x".repeat(81)],
    ["lastName", "x".repeat(81)],
    ["fullName", "x".repeat(161)],
    ["message", "x".repeat(5001)],
    ["topic", "newsletter"],
    ["preferredTime", "x".repeat(41)],
    ["phone", "1".repeat(41)],
    ["residenceType", "x".repeat(81)],
    ["unitId", "not-an-object-id"],
    ["unitLabel", "x".repeat(81)],
    ["pagePath", "apartments"],
    ["pagePath", "//evil.example.com"],
    ["pagePath", "/has space"],
    ["pagePath", `/${"a".repeat(300)}`],
  ])("rejects invalid %s", (field, value) => {
    const result = submitContactSchema.safeParse({
      ...basePayload,
      [field]: value,
    });
    expect(result.success).toBe(false);
  });

  it.each([
    ["a URL", "https://spam.example.com", true],
    ["an over-long value", "x".repeat(5000), true],
    ["whitespace only", "   ", true],
    ["a number", 0, true],
    ["an object", { url: "x" }, true],
    ["an empty string", "", false],
    ["null", null, false],
    ["nothing", undefined, false],
  ])("never rejects the website honeypot: %s", (_label, value, filled) => {
    const result = submitContactSchema.safeParse({
      ...basePayload,
      website: value,
    });
    expect(result.success).toBe(true);
    expect(result.data.website).toBe(filled);
  });

  describe("preferredDate", () => {
    beforeEach(() => {
      // Only Date is faked: 9 Oct 2026, mid-morning on the server clock.
      vi.useFakeTimers({ toFake: ["Date"] });
      vi.setSystemTime(new Date(2026, 9, 9, 10, 30));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    const parseDate = (preferredDate) =>
      submitContactSchema.safeParse({
        ...basePayload,
        topic: "tour",
        preferredDate,
      });

    it.each(["2026-10-09", "2026-10-10", "2028-02-29", " 2027-01-01 "])(
      "accepts today or a later real date (%s)",
      (value) => {
        const result = parseDate(value);
        expect(result.success).toBe(true);
        expect(result.data.preferredDate).toBe(value.trim());
      },
    );

    it("treats a blank date as not provided", () => {
      const result = parseDate("");
      expect(result.success).toBe(true);
      expect(result.data.preferredDate).toBeUndefined();
    });

    it.each([
      ["2026-10-08", "preferredDate cannot be in the past"],
      ["2025-12-31", "preferredDate cannot be in the past"],
      ["2026-02-30", "preferredDate must be a valid date in YYYY-MM-DD format"],
      ["2027-13-01", "preferredDate must be a valid date in YYYY-MM-DD format"],
      ["10/20/2026", "preferredDate must be a valid date in YYYY-MM-DD format"],
      [
        "2026-10-20T09:00",
        "preferredDate must be a valid date in YYYY-MM-DD format",
      ],
      ["tomorrow", "preferredDate must be a valid date in YYYY-MM-DD format"],
    ])("rejects %s", (value, message) => {
      const result = parseDate(value);
      expect(result.success).toBe(false);
      expect(result.error.issues).toEqual([
        expect.objectContaining({ path: ["preferredDate"], message }),
      ]);
    });

    it("rejects a non-string date", () => {
      expect(parseDate(20261020).success).toBe(false);
    });
  });
});
