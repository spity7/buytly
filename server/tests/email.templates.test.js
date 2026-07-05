import { describe, expect, it } from "vitest";
import { emailTemplates } from "../src/services/email.templates.js";

describe("emailTemplates", () => {
  it("renders verification email with html, text, and visible link fallback", () => {
    const verifyUrl = "https://buytly.com/verify-email?token=abc123";
    const result = emailTemplates.emailVerification({
      name: "Jane",
      verifyUrl,
    });

    expect(result.subject).toBe("Confirm your Buytly account");
    expect(result.html).toContain("Confirm email address");
    expect(result.html).toContain(verifyUrl);
    expect(result.text).toContain(verifyUrl);
    expect(result.text).toContain("Hi Jane,");
  });

  it("escapes user-provided html in generic template", () => {
    const result = emailTemplates.generic({
      title: "<script>alert(1)</script>",
      message: "<b>Hello</b>",
    });

    expect(result.subject).toBe("<script>alert(1)</script>");
    expect(result.html).not.toContain("<script>");
    expect(result.html).toContain("&lt;b&gt;Hello&lt;/b&gt;");
    expect(result.text).toContain("<b>Hello</b>");
  });

  it("includes branded layout markers in welcome email", () => {
    const result = emailTemplates.welcome({ name: "Alex" });

    expect(result.html).toContain("Buytly");
    expect(result.text).toContain("Thanks for joining Buytly");
    expect(result.subject).toBe("Welcome to Buytly");
  });
});
