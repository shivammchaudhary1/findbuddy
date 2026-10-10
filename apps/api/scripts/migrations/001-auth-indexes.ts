import type { DatabaseMigration } from "../../src/common/database/migrations.js";

export const authIndexesMigration: DatabaseMigration = {
  id: "001-auth-indexes",
  async up(database) {
    const users = database.collection("users");
    await users.createIndex({ email: 1 }, { name: "email_1", unique: true });
    await users.createIndex({ accountStatus: 1 }, { name: "accountStatus_1" });
    await users.createIndex({ createdAt: 1 }, { name: "createdAt_1" });

    const refreshTokens = database.collection("refreshTokens");
    await refreshTokens.createIndex(
      { tokenHash: 1 },
      { name: "tokenHash_1", unique: true },
    );
    await refreshTokens.createIndex({ familyId: 1 }, { name: "familyId_1" });
    await refreshTokens.createIndex(
      { userId: 1, revokedAt: 1 },
      { name: "userId_1_revokedAt_1" },
    );
    await refreshTokens.createIndex(
      { expiresAt: 1 },
      { name: "expiresAt_1", expireAfterSeconds: 0 },
    );

    const actionTokens = database.collection("authActionTokens");
    await actionTokens.createIndex(
      { tokenHash: 1 },
      { name: "tokenHash_1", unique: true },
    );
    await actionTokens.createIndex(
      { userId: 1, type: 1, consumedAt: 1 },
      { name: "userId_1_type_1_consumedAt_1" },
    );
    await actionTokens.createIndex(
      { expiresAt: 1 },
      { name: "expiresAt_1", expireAfterSeconds: 0 },
    );
  },
};
