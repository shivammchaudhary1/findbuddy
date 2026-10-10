import mongoose, {
  type ConnectOptions,
  type Connection,
  type Mongoose,
} from "mongoose";

import type { Environment } from "./env.js";

export interface MongoDriver {
  connect(uri: string, options: ConnectOptions): Promise<unknown>;
  disconnect(): Promise<void>;
  connection: {
    readyState: number;
    db: Connection["db"];
  };
}

export type DatabaseSettings = Pick<
  Environment,
  | "mongodbUri"
  | "mongodbMaxPoolSize"
  | "mongodbMinPoolSize"
  | "mongodbServerSelectionTimeoutMs"
  | "nodeEnv"
>;

export class DatabaseConnection {
  private connectPromise?: Promise<void>;
  private disconnectPromise?: Promise<void>;

  constructor(private readonly driver: MongoDriver) {}

  isReady(): boolean {
    return this.driver.connection.readyState === 1;
  }

  async connect(settings: DatabaseSettings): Promise<void> {
    if (this.isReady()) return;
    if (this.connectPromise) return this.connectPromise;
    if (this.disconnectPromise) await this.disconnectPromise;

    this.connectPromise = this.driver
      .connect(settings.mongodbUri, {
        autoIndex: settings.nodeEnv !== "production",
        maxPoolSize: settings.mongodbMaxPoolSize,
        minPoolSize: settings.mongodbMinPoolSize,
        serverSelectionTimeoutMS: settings.mongodbServerSelectionTimeoutMs,
      })
      .then(() => undefined)
      .finally(() => {
        this.connectPromise = undefined;
      });

    return this.connectPromise;
  }

  async disconnect(): Promise<void> {
    if (this.connectPromise) {
      try {
        await this.connectPromise;
      } catch {
        return;
      }
    }

    if (this.driver.connection.readyState === 0) return;
    if (this.disconnectPromise) return this.disconnectPromise;

    this.disconnectPromise = this.driver.disconnect().finally(() => {
      this.disconnectPromise = undefined;
    });

    return this.disconnectPromise;
  }

  getNativeDatabase(): NonNullable<Connection["db"]> {
    const database = this.driver.connection.db;
    if (!this.isReady() || !database) {
      throw new Error("MongoDB is not connected");
    }

    return database;
  }
}

export function createMongooseDriver(instance: Mongoose): MongoDriver {
  return {
    connect: (uri, options) => instance.connect(uri, options),
    disconnect: () => instance.disconnect(),
    connection: instance.connection,
  };
}

export const databaseConnection = new DatabaseConnection(
  createMongooseDriver(mongoose),
);
