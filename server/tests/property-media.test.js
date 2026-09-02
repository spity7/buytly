import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { mongoAvailable } from "./setup.js";
import { Property } from "../src/modules/properties/property.model.js";

vi.mock("../src/services/gcs.service.js", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    gcsService: {
      ...actual.gcsService,
      uploadFile: vi.fn(async (buffer, { mimeType } = {}) => ({
        gcsKey: `properties/mock-${mimeType || "file"}`,
        mimeType: mimeType || "application/octet-stream",
        size: buffer?.length || 0,
      })),
      getSignedUrl: vi.fn(async () => "https://example.com/signed-media"),
      deleteFile: vi.fn(async () => {}),
    },
  };
});

const getApp = async () => {
  const { default: app } = await import("../src/app.js");
  return app;
};

const registerAndGetToken = async (app, email = "media-seller@example.com") => {
  const res = await request(app)
    .post("/api/v1/auth/register")
    .send({
      email,
      password: "password123",
      confirmPassword: "password123",
      firstName: "Media",
      role: "seller",
    });
  return res.body.data.accessToken;
};

describe.skipIf(!mongoAvailable)("property media uploads", () => {
  beforeEach(async () => {
    const { gcsService } = await import("../src/services/gcs.service.js");
    gcsService.uploadFile.mockClear();
  });

  it("allows one video and rejects a second video upload", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app);

    const created = await request(app)
      .post("/api/v1/properties")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Video Limit Property",
        description: "Property used to test single video uploads.",
        type: "apartment",
        listingType: "sale",
        price: 250000,
        location: {
          coordinates: [55.2708, 25.2048],
          address: "123 Main St",
          city: "Dubai",
          country: "UAE",
        },
      });

    const propertyId = created.body.data._id;

    const firstVideo = await request(app)
      .post(`/api/v1/properties/${propertyId}/media`)
      .set("Authorization", `Bearer ${token}`)
      .attach("media", Buffer.from("fake-video"), {
        filename: "tour.mp4",
        contentType: "video/mp4",
      });

    expect(firstVideo.status).toBe(201);
    expect(firstVideo.body.data.type).toBe("video");

    const secondVideo = await request(app)
      .post(`/api/v1/properties/${propertyId}/media`)
      .set("Authorization", `Bearer ${token}`)
      .attach("media", Buffer.from("another-video"), {
        filename: "tour-2.mp4",
        contentType: "video/mp4",
      });

    expect(secondVideo.status).toBe(400);
    expect(secondVideo.body.message).toMatch(/already has a video/i);

    const property = await Property.findById(propertyId);
    expect(property.media.filter((item) => item.type === "video")).toHaveLength(1);
  });
});
