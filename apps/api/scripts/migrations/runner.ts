import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import pino from "pino";

import { runMigrations } from "../../src/common/database/migrations.js";
import { databaseConnection } from "../../src/config/database.js";
import { parseEnvironment } from "../../src/config/env.js";
import { createLogger } from "../../src/config/logger.js";
import { registeredMigrations } from "./index.js";

export async function runRegisteredMigrations(): Promise<number> {
  const environment = parseEnvironment();
  const logger = createLogger(environment);

  await databaseConnection.connect(environment);

  try {
    const appliedCount = await runMigrations({
      database: databaseConnection.getNativeDatabase(),
      logger,
      migrations: registeredMigrations,
    });
    logger.info({ appliedCount }, "database migrations finished");
    return appliedCount;
  } finally {
    await databaseConnection.disconnect();
  }
}

const executedFile = process.argv[1] ? resolve(process.argv[1]) : undefined;
if (executedFile === fileURLToPath(import.meta.url)) {
  void runRegisteredMigrations().catch((error: unknown) => {
    pino({ base: { service: "findbuddy-migrations" } }).fatal(
      { err: error },
      "database migration failed",
    );
    process.exitCode = 1;
  });
}
