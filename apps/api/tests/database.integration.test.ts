import { randomUUID } from "node:crypto";

import { Model, Mongoose, Schema, type InferSchemaType } from "mongoose";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { baseSchemaOptions } from "../src/common/database/schema-options.js";
import { readTestDatabaseUri } from "../src/common/database/test-database.js";
import {
  createMongooseDriver,
  DatabaseConnection,
} from "../src/config/database.js";

const testMongoUri = readTestDatabaseUri();

const probeSchema = new Schema(
  {
    key: { type: String, required: true },
    status: {
      type: String,
      enum: ["ACTIVE", "REMOVED"],
      required: true,
    },
  },
  baseSchemaOptions,
);
probeSchema.index({ key: 1 }, { unique: true });

type Probe = InferSchemaType<typeof probeSchema>;

describe.skipIf(!testMongoUri)("MongoDB repository integration", () => {
  const instance = new Mongoose();
  const database = new DatabaseConnection(createMongooseDriver(instance));
  let ProbeModel: Model<Probe>;

  beforeAll(async () => {
    await database.connect({
      nodeEnv: "test",
      mongodbUri: testMongoUri!,
      mongodbMaxPoolSize: 2,
      mongodbMinPoolSize: 0,
      mongodbServerSelectionTimeoutMs: 5000,
    });
    ProbeModel = instance.model<Probe>("Step3Probe", probeSchema);
    await ProbeModel.init();
  });

  afterAll(async () => {
    if (ProbeModel) await ProbeModel.deleteMany({});
    await database.disconnect();
  });

  it("writes, reads, and enforces the declared unique index", async () => {
    const key = `probe-${randomUUID()}`;
    await ProbeModel.create({ key, status: "ACTIVE" });

    await expect(ProbeModel.findOne({ key }).lean()).resolves.toMatchObject({
      key,
      status: "ACTIVE",
    });
    await expect(
      ProbeModel.create({ key, status: "ACTIVE" }),
    ).rejects.toMatchObject({ code: 11000 });
    expect(probeSchema.get("timestamps")).toBe(true);
    expect(probeSchema.indexes()).toEqual(
      expect.arrayContaining([
        [{ key: 1 }, expect.objectContaining({ unique: true })],
      ]),
    );
  });
});
