import request from "supertest";
import { Property } from "../../src/modules/properties/property.model.js";
import { Project } from "../../src/modules/projects/project.model.js";

export const projectPayload = (overrides = {}) => ({
  title: "Sunset Residences",
  description:
    "A premium development with modern amenities and great location.",
  kind: "single",
  location: {
    coordinates: [55.2708, 25.2048],
    address: "123 Main St",
    city: "Dubai",
    country: "UAE",
  },
  amenities: [],
  status: "draft",
  ...overrides,
});

export const propertyPayload = (projectId, overrides = {}) => ({
  projectId,
  title: "Modern Downtown Apartment",
  description:
    "A spacious apartment in the heart of downtown with great views.",
  type: "villa",
  price: 350000,
  currency: "USD",
  bedrooms: 2,
  bathrooms: 2,
  area: 120,
  status: "draft",
  ...overrides,
});

export const createProject = async (app, token, overrides = {}) => {
  const res = await request(app)
    .post("/api/v1/projects")
    .set("Authorization", `Bearer ${token}`)
    .send(projectPayload(overrides));
  return res;
};

export const createPropertyForProject = async (
  app,
  token,
  projectId,
  overrides = {},
) => {
  return request(app)
    .post("/api/v1/properties")
    .set("Authorization", `Bearer ${token}`)
    .send(propertyPayload(projectId, overrides));
};

export const buildPropertyBody = async (app, token, overrides = {}) => {
  const projectRes = await createProject(app, token);
  return propertyPayload(projectRes.body.data._id, overrides);
};

export const createActiveProperty = async (
  app,
  sellerToken,
  overrides = {},
) => {
  const projectRes = await createProject(app, sellerToken, {
    title: overrides.projectTitle || "Test Project",
    kind: "single",
  });
  const projectId = projectRes.body.data._id;

  const created = await createPropertyForProject(app, sellerToken, projectId, {
    title: overrides.title || "Listed Property",
    ...overrides,
  });

  await Property.findByIdAndUpdate(created.body.data._id, { status: "active" });
  await Project.findByIdAndUpdate(projectId, { status: "active" });
  return created.body.data._id;
};
