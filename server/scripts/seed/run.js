import bcrypt from "bcrypt";
import { connectDB, disconnectDB, isDBConnected } from "../../src/config/db.js";
import { buildArchiveUpdate } from "../../src/modules/properties/property-status.js";
import { cacheService } from "../../src/services/cache.service.js";
import { User } from "../../src/modules/users/user.model.js";
import { AgentProfile } from "../../src/modules/agents/agent.model.js";
import { Property } from "../../src/modules/properties/property.model.js";
import { PropertyReview } from "../../src/modules/property-reviews/property-review.model.js";
import { Favorite } from "../../src/modules/favorites/favorite.model.js";
import { Booking } from "../../src/modules/bookings/booking.model.js";
import { Transaction } from "../../src/modules/transactions/transaction.model.js";
import { Notification } from "../../src/modules/notifications/notification.model.js";
import { RefreshToken } from "../../src/modules/auth/refreshToken.model.js";
import { slugify } from "../../src/utils/slugify.js";
import {
  SEED_AGENT_PROFILES,
  SEED_DOMAIN,
  SEED_PROPERTIES,
  SEED_REVIEWS,
  SEED_SAVED_SEARCHES,
  SEED_USERS,
} from "./catalog.js";

const SALT_ROUNDS = 12;

async function buildUniqueSlug(title) {
  let slug = slugify(title);
  let counter = 0;
  let exists = await Property.findOne({ slug });

  while (exists) {
    counter += 1;
    slug = `${slugify(title)}-${counter}`;
    exists = await Property.findOne({ slug });
  }

  return slug;
}

async function clearDatabase() {
  await Promise.all([
    PropertyReview.deleteMany({}),
    Favorite.deleteMany({}),
    Booking.deleteMany({}),
    Transaction.deleteMany({}),
    Notification.deleteMany({}),
    Property.deleteMany({}),
    AgentProfile.deleteMany({}),
    RefreshToken.deleteMany({}),
    User.deleteMany({}),
  ]);
}

async function seedUsers(password) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const usersByKey = {};

  for (const def of SEED_USERS) {
    const user = await User.create({
      email: def.email,
      passwordHash,
      role: def.role,
      firstName: def.firstName,
      lastName: def.lastName,
      phoneCountryCode: def.phoneCountryCode,
      phoneNumber: def.phoneNumber,
      phone: `${def.phoneCountryCode}${def.phoneNumber}`,
      preferences: def.preferences,
      isEmailVerified: true,
      isActive: true,
      authProvider: "local",
    });
    usersByKey[def.key] = user;
  }

  return usersByKey;
}

async function seedAgentProfiles(usersByKey) {
  for (const profile of SEED_AGENT_PROFILES) {
    await AgentProfile.create({
      userId: usersByKey[profile.userKey]._id,
      licenseNumber: profile.licenseNumber,
      agency: profile.agency,
      bio: profile.bio,
      specialties: profile.specialties,
      city: profile.city,
      rating: profile.rating,
      reviewCount: profile.reviewCount,
      isVerified: profile.isVerified,
    });
  }
}

async function seedProperties(usersByKey) {
  const propertiesByTitle = {};

  for (const def of SEED_PROPERTIES) {
    const slug = await buildUniqueSlug(def.title);
    const archiveFields =
      def.status === "archived" ? buildArchiveUpdate() : {};
    const property = await Property.create({
      title: def.title,
      slug,
      description: def.description,
      type: def.type,
      listingType: def.listingType,
      price: def.price,
      currency: def.currency,
      location: {
        type: "Point",
        coordinates: def.coordinates,
        address: def.address,
        city: def.city,
        country: def.country,
      },
      bedrooms: def.bedrooms,
      bathrooms: def.bathrooms,
      area: def.area,
      areaUnit: "sqm",
      amenities: def.amenities,
      status: def.status,
      ...archiveFields,
      ownerId: usersByKey[def.ownerKey]._id,
      agentId: def.agentKey ? usersByKey[def.agentKey]._id : undefined,
      viewCount: def.viewCount,
      media: [],
      floorPlans: [],
    });

    propertiesByTitle[def.title] = property;
  }

  return propertiesByTitle;
}

async function seedReviews(usersByKey, propertiesByTitle) {
  for (const review of SEED_REVIEWS) {
    const property = propertiesByTitle[review.propertyTitle];
    if (!property || property.status !== "active") continue;

    await PropertyReview.create({
      propertyId: property._id,
      userId: usersByKey[review.buyerKey]._id,
      rating: review.rating,
      title: review.title,
      text: review.text,
    });
  }
}

async function seedFavorites(usersByKey, propertiesByTitle) {
  const activeTitles = [
    "Marina View 2BR Apartment",
    "Downtown Burj Khalifa Studio",
    "Palm Jumeirah Garden Home",
    "Saadiyat Island Luxury Villa",
  ];

  await Favorite.create({
    userId: usersByKey.buyer._id,
    propertyId: propertiesByTitle["Marina View 2BR Apartment"]._id,
  });
  await Favorite.create({
    userId: usersByKey.buyer._id,
    propertyId: propertiesByTitle["JVC Family Townhouse"]._id,
  });
  await Favorite.create({
    userId: usersByKey.buyer2._id,
    propertyId: propertiesByTitle["Downtown Burj Khalifa Studio"]._id,
  });
  await Favorite.create({
    userId: usersByKey.buyer2._id,
    propertyId: propertiesByTitle["JLT Lake View 1BR"]._id,
  });

  return activeTitles.length;
}

async function seedBookings(usersByKey, propertiesByTitle) {
  const marina = propertiesByTitle["Marina View 2BR Apartment"];
  const jlt = propertiesByTitle["JLT Lake View 1BR"];
  const now = Date.now();

  await Booking.create([
    {
      propertyId: marina._id,
      buyerId: usersByKey.buyer._id,
      agentId: usersByKey.agent._id,
      scheduledAt: new Date(now + 2 * 24 * 60 * 60 * 1000),
      message: "Interested in a weekend viewing.",
      status: "pending",
    },
    {
      propertyId: jlt._id,
      buyerId: usersByKey.buyer2._id,
      agentId: usersByKey.agent._id,
      scheduledAt: new Date(now + 4 * 24 * 60 * 60 * 1000),
      message: "Can we do an evening slot?",
      status: "approved",
    },
    {
      propertyId: propertiesByTitle["JVC Family Townhouse"]._id,
      buyerId: usersByKey.buyer._id,
      agentId: usersByKey.agent._id,
      scheduledAt: new Date(now - 3 * 24 * 60 * 60 * 1000),
      message: "Family viewing completed.",
      status: "completed",
    },
  ]);
}

async function seedTransactions(usersByKey, propertiesByTitle) {
  const sold = propertiesByTitle["Sold Creek Harbour 2BR"];

  await Transaction.create({
    propertyId: sold._id,
    buyerId: usersByKey.buyer2._id,
    sellerId: usersByKey.seller._id,
    agentId: usersByKey.agent._id,
    type: "buy",
    amount: sold.price,
    currency: sold.currency,
    status: "completed",
    completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    notes: "Completed sale for demo analytics.",
  });

  await Transaction.create({
    propertyId: propertiesByTitle["Dubai Hills Park View Villa"]._id,
    buyerId: usersByKey.buyer._id,
    sellerId: usersByKey.seller._id,
    agentId: usersByKey.agent._id,
    type: "buy",
    amount: 5200000,
    currency: "AED",
    status: "pending",
    notes: "Offer submitted — awaiting seller approval.",
  });
}

async function seedSavedSearches(usersByKey) {
  for (const saved of SEED_SAVED_SEARCHES) {
    const user = usersByKey[saved.userKey];
    user.savedSearches.push({ name: saved.name, filters: saved.filters });
    await user.save();
  }
}

async function seedNotifications(usersByKey, propertiesByTitle) {
  await Notification.create([
    {
      userId: usersByKey.seller._id,
      type: "property",
      title: "New review received",
      message: "A buyer left a 5-star review on Marina View 2BR Apartment.",
      data: {
        propertyId: propertiesByTitle["Marina View 2BR Apartment"]._id,
      },
      isRead: false,
    },
    {
      userId: usersByKey.buyer._id,
      type: "booking",
      title: "Viewing approved",
      message: "Your JLT Lake View 1BR viewing request was approved.",
      data: { propertyId: propertiesByTitle["JLT Lake View 1BR"]._id },
      isRead: true,
      readAt: new Date(),
    },
    {
      userId: usersByKey.admin._id,
      type: "system",
      title: "Pending listing moderation",
      message: "Pending Marina Tower Unit is waiting for admin review.",
      data: {
        propertyId: propertiesByTitle["Pending Marina Tower Unit"]._id,
      },
      isRead: false,
    },
    {
      userId: usersByKey.seller2._id,
      type: "property",
      title: "New review received",
      message: "A buyer left a 5-star review on Saadiyat Island Luxury Villa.",
      data: {
        propertyId: propertiesByTitle["Saadiyat Island Luxury Villa"]._id,
      },
      isRead: false,
    },
  ]);
}

function printSummary(password) {
  console.log("\nBuytly demo seed complete\n");
  console.log("Demo accounts (password for all):");
  console.log(`  ${password}\n`);
  console.log("Email                     Role");
  console.log("------------------------  -------");
  for (const user of SEED_USERS) {
    console.log(`${user.email.padEnd(24)}  ${user.role}`);
  }
  console.log(`\nDomain: @${SEED_DOMAIN} (development/demo only)`);
  console.log("Log in at /login and browse /listings or /listings/map.\n");
}

export async function runSeed({ reset = false, password, disconnect = true }) {
  if (process.env.NODE_ENV === "production" && !process.env.SEED_FORCE) {
    throw new Error(
      "Refusing to seed production database. Set SEED_FORCE=true to override.",
    );
  }

  const connectedHere = !isDBConnected();
  if (connectedHere) {
    await connectDB();
  }

  if (reset) {
    console.log("[seed] Clearing existing data...");
    await clearDatabase();
  }

  console.log("[seed] Creating users...");
  const usersByKey = await seedUsers(password);

  console.log("[seed] Creating agent profiles...");
  await seedAgentProfiles(usersByKey);

  console.log("[seed] Creating properties...");
  const propertiesByTitle = await seedProperties(usersByKey);

  console.log("[seed] Creating reviews...");
  await seedReviews(usersByKey, propertiesByTitle);

  console.log("[seed] Creating favorites...");
  await seedFavorites(usersByKey, propertiesByTitle);

  console.log("[seed] Creating bookings...");
  await seedBookings(usersByKey, propertiesByTitle);

  console.log("[seed] Creating transactions...");
  await seedTransactions(usersByKey, propertiesByTitle);

  console.log("[seed] Creating saved searches...");
  await seedSavedSearches(usersByKey);

  console.log("[seed] Creating notifications...");
  await seedNotifications(usersByKey, propertiesByTitle);

  if (cacheService.isEnabled()) {
    console.log("[seed] Invalidating listing caches...");
    await cacheService.invalidateListingCaches();
  }

  printSummary(password);

  if (disconnect && connectedHere) {
    await disconnectDB();
  }
}
