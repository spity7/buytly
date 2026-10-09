import { describe, it, expect } from "vitest";
import mongoose from "mongoose";
import { mongoAvailable } from "./setup.js";
import { listCollectionIndexes } from "../src/shared/collectionIndexes.js";
import { ensureCatalogIndexes } from "../src/modules/catalog/catalog.indexes.js";
import { ensureUserIndexes } from "../src/modules/users/user.indexes.js";
import { AmenityCatalog } from "../src/modules/catalog/amenity.model.js";
import { PropertyTypeCatalog } from "../src/modules/catalog/property-type.model.js";
import { User } from "../src/modules/users/user.model.js";

describe("listCollectionIndexes", () => {
  it("returns [] when the collection does not exist (NamespaceNotFound)", async () => {
    const collection = {
      indexes: async () => {
        throw Object.assign(new Error("ns does not exist"), {
          code: 26,
          codeName: "NamespaceNotFound",
        });
      },
    };
    await expect(listCollectionIndexes(collection)).resolves.toEqual([]);
  });

  it("rethrows other errors", async () => {
    const collection = {
      indexes: async () => {
        throw Object.assign(new Error("not authorized"), { code: 13 });
      },
    };
    await expect(listCollectionIndexes(collection)).rejects.toThrow(
      "not authorized",
    );
  });
});

describe.skipIf(!mongoAvailable)("startup index bootstrap on an empty database", () => {
  const dropIfExists = async (Model) => {
    const exists = await mongoose.connection.db
      .listCollections({ name: Model.collection.collectionName })
      .hasNext();
    if (exists) await Model.collection.drop();
  };

  it("creates the catalog and user indexes when the collections do not exist yet", async () => {
    await dropIfExists(AmenityCatalog);
    await dropIfExists(PropertyTypeCatalog);
    await dropIfExists(User);

    await expect(ensureCatalogIndexes()).resolves.toBeUndefined();
    await expect(ensureUserIndexes()).resolves.toBeUndefined();

    const amenityIndexes = await AmenityCatalog.collection.indexes();
    expect(amenityIndexes.some((index) => index.key?.siteId && index.key?.value)).toBe(true);
    const userIndexes = await User.collection.indexes();
    expect(userIndexes.some((index) => index.key?.siteId && index.key?.email)).toBe(true);
  });
});
