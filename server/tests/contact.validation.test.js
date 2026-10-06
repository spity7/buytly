import { describe, expect, it } from "vitest";
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

  it("rejects short message", () => {
    const result = submitContactSchema.safeParse({
      ...basePayload,
      message: "Hi",
    });
    expect(result.success).toBe(false);
  });

  it("still requires lastName", () => {
    const rest = { ...basePayload };
    delete rest.lastName;
    expect(submitContactSchema.safeParse(rest).success).toBe(false);
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
});
