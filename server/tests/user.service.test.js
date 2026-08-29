import { describe, it, expect, vi } from "vitest";
import { mongoAvailable } from "./setup.js";
import { User } from "../src/modules/users/user.model.js";

const mockResolveAvatar = vi.fn(async (avatar) => ({
  gcsKey: avatar.gcsKey,
  mimeType: avatar.mimeType,
  size: avatar.size,
  url: "https://example.com/signed-avatar.png",
}));

const mockDeleteFile = vi.fn(async () => {});

vi.mock("../src/services/gcs.service.js", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    gcsService: {
      ...actual.gcsService,
      resolveAvatar: mockResolveAvatar,
      deleteFile: mockDeleteFile,
    },
  };
});

describe.skipIf(!mongoAvailable)("user.service", () => {
  it("getMe includes signed avatar URL in JSON-safe plain object", async () => {
    const { userService } =
      await import("../src/modules/users/user.service.js");

    const user = await User.create({
      email: "avatar-profile@example.com",
      passwordHash: "hash",
      avatar: {
        gcsKey: "avatars/test.png",
        mimeType: "image/png",
        size: 42,
      },
    });

    const profile = await userService.getMe(user._id);

    expect(mockResolveAvatar).toHaveBeenCalled();
    expect(profile.avatar).toEqual({
      gcsKey: "avatars/test.png",
      mimeType: "image/png",
      size: 42,
      url: "https://example.com/signed-avatar.png",
    });
  });

  it("deleteAccount unsets avatar, stores deletedEmail, and retains related data", async () => {
    const { userService } =
      await import("../src/modules/users/user.service.js");
    const { Property } =
      await import("../src/modules/properties/property.model.js");

    const user = await User.create({
      email: "delete-retention@example.com",
      passwordHash: await (
        await import("bcrypt")
      ).default.hash("password123", 12),
      avatar: {
        gcsKey: "avatars/delete-me.png",
        mimeType: "image/png",
        size: 100,
      },
    });

    await Property.create({
      title: "Live listing",
      slug: "live-listing-delete-test",
      description: "Should stay active",
      type: "apartment",
      listingType: "sale",
      price: 250000,
      location: {
        city: "Dubai",
        country: "UAE",
        coordinates: [55.2708, 25.2048],
      },
      ownerId: user._id,
      status: "active",
    });

    await userService.deleteAccount(user._id, "password123");

    expect(mockDeleteFile).toHaveBeenCalledWith("avatars/delete-me.png");

    const deleted = await User.findById(user._id)
      .select("+passwordHash")
      .lean();
    expect(deleted.deletedAt).toBeTruthy();
    expect(deleted.isActive).toBe(false);
    expect(deleted.deletedEmail).toBe("delete-retention@example.com");
    expect(deleted.email).toBe(`deleted_${user._id}@deleted.buytly.internal`);
    expect(deleted.avatar).toBeUndefined();

    const listing = await Property.findOne({ ownerId: user._id });
    expect(listing.status).toBe("active");
    expect(listing.deletedAt).toBeNull();
  });
});
