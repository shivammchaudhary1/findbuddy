import type { Connection } from "mongoose";
import type { Logger } from "pino";

type NativeDatabase = NonNullable<Connection["db"]>;

export type DatabaseMigration = {
  id: string;
  up(database: NativeDatabase): Promise<void>;
};

type MigrationRecord = {
  id: string;
  completedAt: Date;
};

export async function runMigrations(options: {
  database: NativeDatabase;
  logger: Logger;
  migrations: readonly DatabaseMigration[];
}): Promise<number> {
  const migrationIds = options.migrations.map((migration) => migration.id);
  if (new Set(migrationIds).size !== migrationIds.length) {
    throw new Error("Migration ids must be unique");
  }

  const records =
    options.database.collection<MigrationRecord>("schemaMigrations");
  await records.createIndex({ id: 1 }, { unique: true });

  let appliedCount = 0;
  const orderedMigrations = [...options.migrations].sort((left, right) =>
    left.id.localeCompare(right.id),
  );

  for (const migration of orderedMigrations) {
    const completed = await records.findOne({ id: migration.id });
    if (completed) continue;

    options.logger.info({ migrationId: migration.id }, "migration started");
    await migration.up(options.database);
    await records.insertOne({ id: migration.id, completedAt: new Date() });
    appliedCount += 1;
    options.logger.info({ migrationId: migration.id }, "migration completed");
  }

  return appliedCount;
}
