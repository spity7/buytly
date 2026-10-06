import { describe, it, expect } from "vitest";
import { api } from "./helpers/http.js";
import { mongoAvailable } from "./setup.js";
import { registerAndGetToken } from "./helpers/authFixtures.js";
import {
  buildPropertyBody,
  createActiveProperty,
} from "./helpers/listingFixtures.js";
import { Property } from "../src/modules/properties/property.model.js";
import { Project } from "../src/modules/projects/project.model.js";
import {
  createPropertySchema,
  updatePropertySchema,
} from "../src/modules/properties/property.validation.js";
import { hasMaterialChanges } from "../src/modules/properties/property-status.js";

const getApp = async () => {
  const { default: app } = await import("../src/app.js");
  return app;
};

describe("building/floor validation", () => {
  const base = {
    projectId: "a".repeat(24),
    title: "Unit A-101",
    description: "A unit with a known block and floor.",
    type: "apartment",
    price: 250000,
  };

  it("accepts optional building/floor and trims the building", () => {
    const parsed = createPropertySchema.parse({
      ...base,
      building: "  A  ",
      floor: 3,
    });
    expect(parsed.building).toBe("A");
    expect(parsed.floor).toBe(3);
    expect(createPropertySchema.safeParse(base).success).toBe(true);
  });

  it("allows null to clear on update", () => {
    const parsed = updatePropertySchema.parse({ building: null, floor: null });
    expect(parsed).toEqual({ building: null, floor: null });
  });

  it("rejects out-of-range or non-integer floors and long buildings", () => {
    for (const floor of [2.5, -6, 301, "3"]) {
      expect(updatePropertySchema.safeParse({ floor }).success).toBe(false);
    }
    expect(updatePropertySchema.safeParse({ floor: -5 }).success).toBe(true);
    expect(updatePropertySchema.safeParse({ floor: 300 }).success).toBe(true);
    expect(
      updatePropertySchema.safeParse({ building: "x".repeat(51) }).success,
    ).toBe(false);
  });

  it("are not material fields", () => {
    const property = { title: "Unit", building: "A", floor: 1 };
    expect(hasMaterialChanges(property, { building: "B", floor: 2 })).toBe(
      false,
    );
  });

  it("model rejects a fractional floor", async () => {
    const doc = new Property({ floor: 1.5 });
    const error = doc.validateSync(["floor"]);
    expect(error?.errors?.floor).toBeDefined();
  });
});

describe.skipIf(!mongoAvailable)("building/floor API", () => {
  it("creates a unit with building/floor and returns them", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, "bf-create@example.com");

    const res = await api(app)
      .post("/api/v1/properties")
      .set("Authorization", `Bearer ${token}`)
      .send(await buildPropertyBody(app, token, { building: " B ", floor: 4 }));

    expect(res.status).toBe(201);
    expect(res.body.data.building).toBe("B");
    expect(res.body.data.floor).toBe(4);

    const stored = await Property.findById(res.body.data._id).lean();
    expect(stored.building).toBe("B");
    expect(stored.floor).toBe(4);
  });

  it("omits building/floor when not sent, null or blank", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, "bf-omit@example.com");

    const res = await api(app)
      .post("/api/v1/properties")
      .set("Authorization", `Bearer ${token}`)
      .send(
        await buildPropertyBody(app, token, { building: "  ", floor: null }),
      );

    expect(res.status).toBe(201);
    expect(res.body.data).not.toHaveProperty("building");
    expect(res.body.data).not.toHaveProperty("floor");
  });

  it("rejects an invalid floor with 400", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, "bf-invalid@example.com");

    const res = await api(app)
      .post("/api/v1/properties")
      .set("Authorization", `Bearer ${token}`)
      .send(await buildPropertyBody(app, token, { floor: 1.5 }));

    expect(res.status).toBe(400);
  });

  it("updates and clears building/floor (null unsets the stored value)", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, "bf-update@example.com");
    const created = await api(app)
      .post("/api/v1/properties")
      .set("Authorization", `Bearer ${token}`)
      .send(await buildPropertyBody(app, token));
    const id = created.body.data._id;

    const set = await api(app)
      .patch(`/api/v1/properties/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ building: "C", floor: -1 });
    expect(set.status).toBe(200);
    expect(set.body.data.building).toBe("C");
    expect(set.body.data.floor).toBe(-1);

    const cleared = await api(app)
      .patch(`/api/v1/properties/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ building: null, floor: null });
    expect(cleared.status).toBe(200);
    expect(cleared.body.data).not.toHaveProperty("building");
    expect(cleared.body.data).not.toHaveProperty("floor");

    const stored = await Property.findById(id).lean();
    expect(stored).not.toHaveProperty("building");
    expect(stored).not.toHaveProperty("floor");

    const detail = await api(app)
      .get(`/api/v1/properties/${id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(detail.body.data).not.toHaveProperty("building");
    expect(detail.body.data).not.toHaveProperty("floor");
  });

  it("keeps an active unit active when a seller edits only building/floor", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, "bf-material@example.com");
    const id = await createActiveProperty(app, token, { title: "Live Unit" });

    const res = await api(app)
      .patch(`/api/v1/properties/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ building: "A", floor: 7 });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("active");
    expect((await Property.findById(id).lean()).status).toBe("active");

    // Control: a material field still sends the unit back to review.
    const material = await api(app)
      .patch(`/api/v1/properties/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ price: 999000 });
    expect(material.body.data.status).toBe("pending");
  });

  it("exposes building/floor on the project page embed", async () => {
    const app = await getApp();
    const token = await registerAndGetToken(app, "bf-embed@example.com");
    const id = await createActiveProperty(app, token, {
      title: "Embedded Unit",
      building: "D",
      floor: 12,
    });
    const { projectId } = await Property.findById(id).lean();
    const { slug } = await Project.findById(projectId).lean();

    const res = await api(app).get(`/api/v1/projects/slug/${slug}`);

    expect(res.status).toBe(200);
    const unit = res.body.data.units.find((row) => row._id === id);
    expect(unit.building).toBe("D");
    expect(unit.floor).toBe(12);
  });
});
