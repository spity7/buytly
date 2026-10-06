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

  it("includes inquiry details in the contact inbox email", () => {
    const result = emailTemplates.contactInquiry({
      fullName: "Ama Mensah",
      email: "ama@example.com",
      phone: "+233244777772",
      residenceType: "Penthouse",
      unitLabel: "A-101",
      message: "Please send me <b>pricing</b>.",
      sourceUrl: "https://block-57.com/apartments/penthouse/",
    });

    expect(result.text).toContain("From: Ama Mensah");
    expect(result.text).toContain("Phone: +233244777772");
    expect(result.text).toContain("Residence type: Penthouse");
    expect(result.text).toContain("Unit: A-101");
    expect(result.text).toContain(
      "Submitted from: https://block-57.com/apartments/penthouse/",
    );
    expect(result.html).toContain("&lt;b&gt;pricing&lt;/b&gt;");
  });

  it("renders the same Buytly email with an explicit Buytly brand", () => {
    const params = { name: "Alex" };
    expect(
      emailTemplates.welcome({ ...params, brand: { name: "Buytly" } }),
    ).toEqual(emailTemplates.welcome(params));
  });

  it("brands contact emails with the site name", () => {
    const brand = { name: "Block 57" };
    const inquiry = emailTemplates.contactInquiry({
      brand,
      fullName: "Ama Mensah",
      email: "ama@example.com",
      message: "Please send me pricing.",
    });
    const autoReply = emailTemplates.contactAutoReply({ brand, name: "Ama" });

    expect(inquiry.subject).toBe("Block 57 contact form — Ama Mensah");
    expect(inquiry.text).toContain(
      "You received a new message via the Block 57 contact form.",
    );
    expect(autoReply.subject).toBe("We received your message — Block 57");
    expect(autoReply.text).toContain(
      "You received this email because you submitted the contact form on Block 57.",
    );
  });

  it("escapes the brand name in the html header", () => {
    const result = emailTemplates.generic({
      brand: { name: "Smith & <Sons>" },
      title: "Hello",
      message: "Body",
    });

    expect(result.html).toContain("Smith &amp; &lt;Sons&gt;");
    expect(result.html).not.toContain("<Sons>");
    expect(result.text.startsWith("Smith & <Sons>\n")).toBe(true);
  });

  describe("with the Block 57 brand", () => {
    const brand = { name: "Block 57" };
    const sampleParams = {
      welcome: { name: "Ama" },
      emailVerification: {
        name: "Ama",
        verifyUrl: "http://localhost:3002/verify-email?token=abc",
      },
      passwordReset: {
        name: "Ama",
        resetUrl: "http://localhost:3002/reset-password?token=abc",
      },
      passwordChanged: { name: "Ama" },
      bookingStatus: {
        name: "Ama",
        status: "confirmed",
        propertyTitle: "A-101",
      },
      transactionUpdate: {
        name: "Ama",
        status: "completed",
        propertyTitle: "A-101",
      },
      propertyStatus: { name: "Ama", status: "active", propertyTitle: "A-101" },
      newReview: { name: "Ama", propertyTitle: "A-101", rating: 5 },
      generic: { title: "Update", message: "Something changed." },
      contactInquiry: {
        fullName: "Ama Mensah",
        email: "ama@example.com",
        message: "Please send me pricing.",
      },
      contactAutoReply: { name: "Ama" },
    };

    it("covers every template", () => {
      expect(Object.keys(sampleParams).sort()).toEqual(
        Object.keys(emailTemplates).sort(),
      );
    });

    it.each(Object.entries(sampleParams))(
      "%s says Block 57 and never Buytly",
      (template, params) => {
        const result = emailTemplates[template]({ ...params, brand });

        for (const part of [result.subject, result.html, result.text]) {
          expect(part).not.toContain("Buytly");
        }
        expect(result.html).toContain('letter-spacing:0.3px;">Block 57</p>');
        expect(result.text.startsWith("Block 57\n")).toBe(true);
      },
    );

    it("uses the site name in subjects and footers", () => {
      expect(
        emailTemplates.emailVerification({
          ...sampleParams.emailVerification,
          brand,
        }).subject,
      ).toBe("Confirm your Block 57 account");
      expect(
        emailTemplates.passwordReset({ ...sampleParams.passwordReset, brand })
          .subject,
      ).toBe("Reset your Block 57 password");
      expect(
        emailTemplates.welcome({ ...sampleParams.welcome, brand }).text,
      ).toContain(
        "You received this email because you created a Block 57 account.",
      );
      expect(
        emailTemplates.generic({ ...sampleParams.generic, brand }).text,
      ).toContain("You received this notification from Block 57.");
    });
  });

  it("omits empty optional inquiry details", () => {
    const result = emailTemplates.contactInquiry({
      fullName: "Jane Smith",
      email: "jane@example.com",
      message: "I would like help finding a property.",
    });

    expect(result.text).not.toContain("Phone:");
    expect(result.text).not.toContain("Residence type:");
    expect(result.text).not.toContain("Unit:");
    expect(result.text).not.toContain("Submitted from:");
  });
});
