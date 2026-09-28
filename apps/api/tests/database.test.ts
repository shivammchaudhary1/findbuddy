import { Schema, type Connection } from "mongoose";
import pino from "pino";
import { describe, expect, it, vi } from "vitest";

import { runMigrations } from "../src/common/database/migrations.js";
import {
  baseSchemaOptions,
  visibleStatusFilter,
} from "../src/common/database/schema-options.js";
import {
  assertTestDatabaseUri,
  readTestDatabaseUri,
} from "../src/common/database/test-database.js";
import {
  DatabaseConnection,
  type DatabaseSettings,
  type MongoDriver,
} from "../src/config/database.js";
import { fixtureDate, fixtureObjectId } from "./helpers/fixtures.js";
import { authIndexesMigration } from "../scripts/migrations/001-auth-indexes.js";
import { profileMediaIndexesMigration } from "../scripts/migrations/002-profile-media-indexes.js";
import { mediaSchema } from "../src/modules/media/media.model.js";
import { profileSchema } from "../src/modules/profiles/profile.model.js";
import { authActionTokenSchema } from "../src/modules/auth/auth-action-token.model.js";
import { refreshTokenSchema } from "../src/modules/auth/refresh-token.model.js";
import { userSchema } from "../src/modules/users/user.model.js";

const settings: DatabaseSettings = {
  nodeEnv: "test",
  mongodbUri: "mongodb://127.0.0.1:27017/findbuddy_test",
  mongodbMaxPoolSize: 10,
  mongodbMinPoolSize: 0,
  mongodbServerSelectionTimeoutMs: 1000,
};

function createFakeDriver(): MongoDriver & {
  connect: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
} {
  const connection: MongoDriver["connection"] = {
    readyState: 0,
    db: undefined,
  };

  return {
    connection,
    connect: vi.fn(async () => {
      connection.readyState = 1;
    }),
    disconnect: vi.fn(async () => {
      connection.readyState = 0;
    }),
  };
}

describe("MongoDB connection lifecycle", () => {
  it("deduplicates connection and disconnection calls", async () => {
    const driver = createFakeDriver();
    const database = new DatabaseConnection(driver);

    await Promise.all([database.connect(settings), database.connect(settings)]);

    expect(driver.connect).toHaveBeenCalledTimes(1);
    expect(driver.connect).toHaveBeenCalledWith(
      settings.mongodbUri,
      expect.objectContaining({
        autoIndex: true,
        maxPoolSize: 10,
        minPoolSize: 0,
        serverSelectionTimeoutMS: 1000,
      }),
    );
    expect(database.isReady()).toBe(true);

    await Promise.all([database.disconnect(), database.disconnect()]);
    expect(driver.disconnect).toHaveBeenCalledTimes(1);
    expect(database.isReady()).toBe(false);
  });

  it("disables automatic index creation in production", async () => {
    const driver = createFakeDriver();
    const database = new DatabaseConnection(driver);

    await database.connect({ ...settings, nodeEnv: "production" });

    expect(driver.connect).toHaveBeenCalledWith(
      settings.mongodbUri,
      expect.objectContaining({ autoIndex: false }),
    );
  });

  it("can retry after a failed connection", async () => {
    const driver = createFakeDriver();
    driver.connect
      .mockRejectedValueOnce(new Error("connection failed"))
      .mockImplementationOnce(async () => {
        driver.connection.readyState = 1;
      });
    const database = new DatabaseConnection(driver);

    await expect(database.connect(settings)).rejects.toThrow(
      "connection failed",
    );
    await expect(database.connect(settings)).resolves.toBeUndefined();
    expect(driver.connect).toHaveBeenCalledTimes(2);
  });

  it("refuses native database access before connecting", () => {
    const database = new DatabaseConnection(createFakeDriver());
    expect(() => database.getNativeDatabase()).toThrow(
      "MongoDB is not connected",
    );
  });
});

describe("database safety and conventions", () => {
  it("accepts only explicitly test-named database URIs", () => {
    expect(
      assertTestDatabaseUri(
        "mongodb://127.0.0.1:27017/findbuddy_test?retryWrites=true",
      ),
    ).toContain("findbuddy_test");
    expect(
      assertTestDatabaseUri("mongodb+srv://cluster.example/findbuddy-test"),
    ).toContain("findbuddy-test");
    expect(() =>
      assertTestDatabaseUri("mongodb://127.0.0.1:27017/findbuddy_production"),
    ).toThrow(/test segment/);
    expect(() => assertTestDatabaseUri("mongodb://127.0.0.1:27017")).toThrow(
      /test segment/,
    );
    expect(readTestDatabaseUri({})).toBeUndefined();
  });

  it("provides strict timestamp and status-filter conventions", () => {
    expect(baseSchemaOptions).toEqual({
      strict: "throw",
      timestamps: true,
      versionKey: false,
    });
    expect(visibleStatusFilter(["ACTIVE", "PAUSED"])).toEqual({
      status: { $in: ["ACTIVE", "PAUSED"] },
    });
  });

  it("retains indexes declared by a repository model", () => {
    const schema = new Schema(
      {
        ownerId: { type: String, required: true },
        status: { type: String, required: true },
      },
      baseSchemaOptions,
    );
    schema.index({ ownerId: 1, status: 1 });

    expect(schema.indexes()).toEqual(
      expect.arrayContaining([
        [{ ownerId: 1, status: 1 }, expect.objectContaining({})],
      ]),
    );
    expect(schema.get("timestamps")).toBe(true);
    expect(schema.get("strict")).toBe("throw");
  });

  it("declares required authentication uniqueness and TTL indexes", () => {
    expect(userSchema.path("passwordHash").options.select).toBe(false);
    expect(userSchema.indexes()).toEqual(
      expect.arrayContaining([
        [{ email: 1 }, expect.objectContaining({ unique: true })],
      ]),
    );
    expect(refreshTokenSchema.indexes()).toEqual(
      expect.arrayContaining([
        [{ tokenHash: 1 }, expect.objectContaining({ unique: true })],
        [{ expiresAt: 1 }, expect.objectContaining({ expireAfterSeconds: 0 })],
      ]),
    );
    expect(authActionTokenSchema.indexes()).toEqual(
      expect.arrayContaining([
        [{ tokenHash: 1 }, expect.objectContaining({ unique: true })],
        [{ expiresAt: 1 }, expect.objectContaining({ expireAfterSeconds: 0 })],
      ]),
    );
  });

  it("declares required profile and media ownership indexes", () => {
    expect(profileSchema.indexes()).toEqual(
      expect.arrayContaining([
        [{ userId: 1 }, expect.objectContaining({ unique: true })],
      ]),
    );
    expect(mediaSchema.indexes()).toEqual(
      expect.arrayContaining([
        [{ objectKey: 1 }, expect.objectContaining({ unique: true })],
        [{ ownerUserId: 1, kind: 1, status: 1 }, expect.objectContaining({})],
      ]),
    );
  });

  it("provides deterministic fixture values", () => {
    expect(fixtureObjectId(15)).toBe("00000000000000000000000f");
    expect(fixtureDate(2).toISOString()).toBe("2026-01-03T12:00:00.000Z");
  });
});

describe("migration runner", () => {
  it("registers production profile and media indexes", async () => {
    const collections = new Map<string, ReturnType<typeof vi.fn>>();
    const nativeDatabase = {
      collection: vi.fn((name: string) => {
        const createIndex = vi.fn(async () => `${name}-index`);
        collections.set(name, createIndex);
        return { createIndex };
      }),
    } as unknown as NonNullable<Connection["db"]>;

    await profileMediaIndexesMigration.up(nativeDatabase);

    expect(collections.get("profiles")).toHaveBeenCalledWith(
      { userId: 1 },
      expect.objectContaining({ unique: true }),
    );
    expect(collections.get("media")).toHaveBeenCalledWith(
      { objectKey: 1 },
      expect.objectContaining({ unique: true }),
    );
  });

  it("registers the production auth indexes, including token TTL indexes", async () => {
    const collections = new Map<string, ReturnType<typeof vi.fn>>();
    const nativeDatabase = {
      collection: vi.fn((name: string) => {
        const createIndex = vi.fn(async () => `${name}-index`);
        collections.set(name, createIndex);
        return { createIndex };
      }),
    } as unknown as NonNullable<Connection["db"]>;

    await authIndexesMigration.up(nativeDatabase);

    expect(collections.get("users")).toHaveBeenCalledWith(
      { email: 1 },
      expect.objectContaining({ unique: true }),
    );
    expect(collections.get("refreshTokens")).toHaveBeenCalledWith(
      { expiresAt: 1 },
      expect.objectContaining({ expireAfterSeconds: 0 }),
    );
    expect(collections.get("authActionTokens")).toHaveBeenCalledWith(
      { expiresAt: 1 },
      expect.objectContaining({ expireAfterSeconds: 0 }),
    );
  });

  it("runs pending migrations in id order and records completion", async () => {
    const completed = new Set(["001-existing"]);
    const executionOrder: string[] = [];
    const collection = {
      createIndex: vi.fn(async () => "id_1"),
      findOne: vi.fn(async ({ id }: { id: string }) =>
        completed.has(id) ? { id, completedAt: fixtureDate() } : null,
      ),
      insertOne: vi.fn(async ({ id }: { id: string }) => {
        completed.add(id);
        return { acknowledged: true };
      }),
    };
    const nativeDatabase = {
      collection: vi.fn(() => collection),
    } as unknown as NonNullable<Connection["db"]>;

    const appliedCount = await runMigrations({
      database: nativeDatabase,
      logger: pino({ enabled: false }),
      migrations: [
        {
          id: "003-third",
          up: async () => {
            executionOrder.push("003-third");
          },
        },
        {
          id: "001-existing",
          up: async () => {
            executionOrder.push("should-not-run");
          },
        },
        {
          id: "002-second",
          up: async () => {
            executionOrder.push("002-second");
          },
        },
      ],
    });

    expect(appliedCount).toBe(2);
    expect(executionOrder).toEqual(["002-second", "003-third"]);
    expect(collection.createIndex).toHaveBeenCalledWith(
      { id: 1 },
      { unique: true },
    );
    expect(collection.insertOne).toHaveBeenCalledTimes(2);
  });

  it("rejects duplicate migration ids before applying changes", async () => {
    const nativeDatabase = {
      collection: vi.fn(),
    } as unknown as NonNullable<Connection["db"]>;
    const duplicate = {
      id: "001-duplicate",
      up: vi.fn(async () => undefined),
    };

    await expect(
      runMigrations({
        database: nativeDatabase,
        logger: pino({ enabled: false }),
        migrations: [duplicate, duplicate],
      }),
    ).rejects.toThrow("Migration ids must be unique");
    expect(duplicate.up).not.toHaveBeenCalled();
  });
});
