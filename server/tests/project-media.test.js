import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { mongoAvailable } from "./setup.js";
import {
  createProject,
  createPropertyForProject,
} from "./helpers/listingFixtures.js";

vi.mock("../src/services/gcs.service.js", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    gcsService: {
      ...actual.gcsService,
      uploadFile: vi.fn(async (buffer, { mimeType } = {}) => ({
        gcsKey: `projects/mock-${mimeType || "file"}`,
        mimeType: mimeType || "application/octet-stream",
        size: buffer?.length || 0,
      })),
      getSignedUrl: vi.fn(
        async () => "https://example.com/signed-project-media",
      ),
      deleteFile: vi.fn(async () => {}),
    },
  };
});

const getApp = async () => {
  const { default: app } = await import("../src/app.js");
  return app;
};

const registerAndGetToken = async (
  app,
  email = "project-media@example.com",
) => {
  const res = await request(app).post("/api/v1/auth/register").send({
    email,
    password: "password123",
    confirmPassword: "password123",
    firstName: "Project",
    role: "seller",
  });
  return res.body.data.accessToken;
};

describe.skipIf(!mongoAvailable)("project media uploads", () => {
  beforeEach(async () => {
    const { gcsService } = await import("../src/services/gcs.service.js");
    gcsService.uploadFile.mockClear();
  });

  it("uploads project images and returns signed url", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app);

    const created = await createProject(app, token, {
      title: "Gallery Project",
    });
    expect(created.status).toBe(201);
    const projectId = created.body.data._id;

    const upload = await request(app)
      .post(`/api/v1/projects/${projectId}/media`)
      .set("Authorization", `Bearer ${token}`)
      .attach("media", Buffer.from("fake-image"), {
        filename: "hero.jpg",
        contentType: "image/jpeg",
      });

    expect(upload.status).toBe(201);
    expect(upload.body.data.type).toBe("image");
    expect(upload.body.data.url).toMatch(/^https:\/\//);

    const detail = await request(app)
      .get(`/api/v1/projects/${projectId}?includeUnits=true`)
      .set("Authorization", `Bearer ${token}`);

    expect(detail.status).toBe(200);
    expect(detail.body.data.media?.length).toBe(1);
    expect(detail.body.data.media[0].url).toMatch(/^https:\/\//);
  });

  it("reorders project photos by imageIds", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, "project-reorder@example.com");

    const created = await createProject(app, token, {
      title: "Reorder Project",
    });
    const projectId = created.body.data._id;

    await request(app)
      .post(`/api/v1/projects/${projectId}/media`)
      .set("Authorization", `Bearer ${token}`)
      .attach("media", Buffer.from("img-a"), {
        filename: "a.jpg",
        contentType: "image/jpeg",
      });

    await request(app)
      .post(`/api/v1/projects/${projectId}/media`)
      .set("Authorization", `Bearer ${token}`)
      .attach("media", Buffer.from("img-b"), {
        filename: "b.jpg",
        contentType: "image/jpeg",
      });

    const detail = await request(app)
      .get(`/api/v1/projects/${projectId}`)
      .set("Authorization", `Bearer ${token}`);

    const images = (detail.body.data.media || []).filter(
      (m) => m.type === "image",
    );
    expect(images.length).toBe(2);

    const reordered = [images[1]._id, images[0]._id];
    const orderRes = await request(app)
      .put(`/api/v1/projects/${projectId}/media/order`)
      .set("Authorization", `Bearer ${token}`)
      .send({ imageIds: reordered });

    expect(orderRes.status).toBe(200);
    const sorted = (orderRes.body.data.media || [])
      .filter((m) => m.type === "image")
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    expect(String(sorted[0]._id)).toBe(String(reordered[0]));
  });

  it("includes signed unit media urls when includeUnits=true", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(
      app,
      "project-unit-thumb@example.com",
    );

    const created = await createProject(app, token, {
      title: "Units With Media",
    });
    const projectId = created.body.data._id;

    const unitRes = await createPropertyForProject(app, token, projectId, {
      title: "Thumb Unit",
    });
    const unitId = unitRes.body.data._id;

    const upload = await request(app)
      .post(`/api/v1/properties/${unitId}/media`)
      .set("Authorization", `Bearer ${token}`)
      .attach("media", Buffer.from("unit-photo"), {
        filename: "unit.jpg",
        contentType: "image/jpeg",
      });

    expect(upload.status).toBe(201);

    const detail = await request(app)
      .get(`/api/v1/projects/${projectId}?includeUnits=true`)
      .set("Authorization", `Bearer ${token}`);

    expect(detail.status).toBe(200);
    expect(detail.body.data.units).toHaveLength(1);
    expect(detail.body.data.units[0].media?.[0]?.url).toMatch(/^https:\/\//);
  });
});
