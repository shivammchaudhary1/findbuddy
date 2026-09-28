import type { DatabaseMigration } from "../../src/common/database/migrations.js";

export const profileMediaIndexesMigration: DatabaseMigration = {
  id: "002-profile-media-indexes",
  async up(database) {
    const profiles = database.collection("profiles");
    await profiles.createIndex(
      { userId: 1 },
      { name: "userId_1", unique: true },
    );
    await profiles.createIndex({ city: 1 }, { name: "city_1" });
    await profiles.createIndex({ pincode: 1 }, { name: "pincode_1" });
    await profiles.createIndex(
      { isIdentityVerified: 1 },
      { name: "isIdentityVerified_1" },
    );
    await profiles.createIndex(
      { averageRating: -1 },
      { name: "averageRating_-1" },
    );

    const media = database.collection("media");
    await media.createIndex(
      { objectKey: 1 },
      { name: "objectKey_1", unique: true },
    );
    await media.createIndex(
      { ownerUserId: 1, kind: 1, status: 1 },
      { name: "ownerUserId_1_kind_1_status_1" },
    );
    await media.createIndex(
      { status: 1, createdAt: 1 },
      { name: "status_1_createdAt_1" },
    );
  },
};
