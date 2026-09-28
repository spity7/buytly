import { describe, expect, it } from "vitest";
import { submitContactSchema } from "../src/modules/contact/contact.validation.js";

describe("submitContactSchema", () => {
  it("accepts valid payload", () => {
    const result = submitContactSchema.safeParse({
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com",
      message: "Hello, I need help with a listing.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short message", () => {
    const result = submitContactSchema.safeParse({
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com",
      message: "Hi",
    });
    expect(result.success).toBe(false);
  });
});
