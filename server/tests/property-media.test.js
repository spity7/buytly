import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { mongoAvailable } from "./setup.js";
import { Property } from "../src/modules/properties/property.model.js";
import { buildPropertyBody } from "./helpers/listingFixtures.js";

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
  const res = await request(app).post("/api/v1/auth/register").send({
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
      .send(
        await buildPropertyBody(app, token, {
          title: "Video Limit Property",
          description: "Property used to test single video uploads.",
          price: 250000,
        }),
      );

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
    expect(property.media.filter((item) => item.type === "video")).toHaveLength(
      1,
    );
  });

  it("reorders listing photos; first id becomes cover order 0", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, "reorder-seller@example.com");

    const created = await request(app)
      .post("/api/v1/properties")
      .set("Authorization", `Bearer ${token}`)
      .send(
        await buildPropertyBody(app, token, {
          title: "Reorder Photos Property",
          description: "Property used to test photo reordering.",
          price: 250000,
        }),
      );

    const propertyId = created.body.data._id;

    const first = await request(app)
      .post(`/api/v1/properties/${propertyId}/media`)
      .set("Authorization", `Bearer ${token}`)
      .attach("media", Buffer.from("image-a"), {
        filename: "a.jpg",
        contentType: "image/jpeg",
      });

    const second = await request(app)
      .post(`/api/v1/properties/${propertyId}/media`)
      .set("Authorization", `Bearer ${token}`)
      .attach("media", Buffer.from("image-b"), {
        filename: "b.jpg",
        contentType: "image/jpeg",
      });

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);

    const idA = first.body.data._id;
    const idB = second.body.data._id;

    const reordered = await request(app)
      .put(`/api/v1/properties/${propertyId}/media/order`)
      .set("Authorization", `Bearer ${token}`)
      .send({ imageIds: [idB, idA] });

    expect(reordered.status).toBe(200);

    const stored = await Property.findById(propertyId);
    const images = stored.media
      .filter((item) => item.type !== "video")
      .sort((a, b) => a.order - b.order);

    expect(images.map((item) => String(item._id))).toEqual([idB, idA]);
    expect(images[0].order).toBe(0);
    expect(images[1].order).toBe(1);
  });
});
