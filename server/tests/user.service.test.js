import { describe, it, expect, vi } from "vitest";
import { mongoAvailable } from "./setup.js";
import { User } from "../src/modules/users/user.model.js";

const mockResolveAvatar = vi.fn(async (avatar) => ({
  gcsKey: avatar.gcsKey,
  mimeType: avatar.mimeType,
  size: avatar.size,
  url: "https://example.com/signed-avatar.png",
}));

vi.mock("../src/services/gcs.service.js", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    gcsService: {
      ...actual.gcsService,
      resolveAvatar: mockResolveAvatar,
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
});
