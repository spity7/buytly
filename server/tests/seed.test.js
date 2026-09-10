import { describe, it, expect } from "vitest";
import request from "supertest";
import { mongoAvailable } from "./setup.js";
import { runSeed } from "../scripts/seed/run.js";
import { SEED_DOMAIN, SEED_EXPECTED_COUNTS } from "../scripts/seed/catalog.js";
import { User } from "../src/modules/users/user.model.js";
import { AgentProfile } from "../src/modules/agents/agent.model.js";
import { Property } from "../src/modules/properties/property.model.js";
import { PropertyReview } from "../src/modules/property-reviews/property-review.model.js";
import { Favorite } from "../src/modules/favorites/favorite.model.js";
import { Booking } from "../src/modules/bookings/booking.model.js";
import { Transaction } from "../src/modules/transactions/transaction.model.js";
import { Notification } from "../src/modules/notifications/notification.model.js";

const DEMO_PASSWORD = "BuytlyDemo2026!";

const getApp = async () => {
  const { default: app } = await import("../src/app.js");
  return app;
};

describe.skipIf(!mongoAvailable)("seed script", () => {
  it("loads demo dataset with expected counts and authenticates demo users", async () => {
    await runSeed({
      reset: true,
      password: DEMO_PASSWORD,
      disconnect: false,
    });

    expect(await User.countDocuments()).toBe(SEED_EXPECTED_COUNTS.users);
    expect(await AgentProfile.countDocuments()).toBe(
      SEED_EXPECTED_COUNTS.agentProfiles,
    );
    expect(await Property.countDocuments()).toBe(
      SEED_EXPECTED_COUNTS.properties,
    );
    expect(await PropertyReview.countDocuments()).toBe(
      SEED_EXPECTED_COUNTS.reviews,
    );
    expect(await Favorite.countDocuments()).toBe(
      SEED_EXPECTED_COUNTS.favorites,
    );
    expect(await Booking.countDocuments()).toBe(SEED_EXPECTED_COUNTS.bookings);
    expect(await Transaction.countDocuments()).toBe(
      SEED_EXPECTED_COUNTS.transactions,
    );
    expect(await Notification.countDocuments()).toBe(
      SEED_EXPECTED_COUNTS.notifications,
    );

    const seller2Reviews = await PropertyReview.find({
      propertyId: {
        $in: await Property.find({
          title: {
            $in: [
              "Saadiyat Island Luxury Villa",
              "Al Reem Island 3BR Apartment",
              "Yas Island Investment Apartment",
            ],
          },
        }).distinct("_id"),
      },
    });
    expect(seller2Reviews).toHaveLength(3);

    const archived = await Property.findOne({
      title: "Archived Legacy Marina Loft",
    });
    expect(archived?.status).toBe("archived");
    expect(archived?.deletedAt).toBeTruthy();

    const land = await Property.findOne({ title: "Al Shamkha Residential Land" });
    expect(land?.type).toBe("land");
    expect(land?.status).toBe("active");

    const app = await getApp();
    const login = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: `buyer@${SEED_DOMAIN}`, password: DEMO_PASSWORD });

    expect(login.status).toBe(200);
    expect(login.body.data.accessToken).toBeTypeOf("string");
    expect(login.body.data.user.email).toBe(`buyer@${SEED_DOMAIN}`);
  });
});
