import type { Server } from "node:http";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import pino, { type Logger } from "pino";

import { createApp } from "./app.js";
import {
  databaseConnection,
  type DatabaseConnection,
} from "./config/database.js";
import { parseEnvironment, type Environment } from "./config/env.js";
import { createLogger } from "./config/logger.js";
import { createApiRouter } from "./routes/api.routes.js";

export type StartServerOptions = {
  environment?: Environment;
  logger?: Logger;
  database?: DatabaseConnection;
};

export async function startServer(
  options: StartServerOptions = {},
): Promise<Server> {
  const environment = options.environment ?? parseEnvironment();
  const logger = options.logger ?? createLogger(environment);
  const database = options.database ?? databaseConnection;

  await database.connect(environment);
  logger.info("MongoDB connection established");

  const app = createApp({
    environment,
    logger,
    additionalRouter: createApiRouter(environment, logger),
    readinessCheck: async () => {
      const databaseReady = database.isReady();
      return {
        ready: databaseReady,
        checks: {
          api: "ready",
          database: databaseReady ? "ready" : "not_ready",
        },
      };
    },
  });

  const server = app.listen(environment.port, environment.host);

  try {
    await waitForListening(server);
  } catch (error) {
    await database.disconnect();
    throw error;
  }

  logger.info(
    { host: environment.host, port: environment.port },
    "FindBuddy API listening",
  );
  registerShutdownHandlers(
    server,
    database,
    logger,
    environment.shutdownTimeoutMs,
  );

  return server;
}

function waitForListening(server: Server): Promise<void> {
  return new Promise((resolveListening, rejectListening) => {
    const onListening = (): void => {
      server.off("error", onError);
      resolveListening();
    };
    const onError = (error: Error): void => {
      server.off("listening", onListening);
      rejectListening(error);
    };

    server.once("listening", onListening);
    server.once("error", onError);
  });
}

function registerShutdownHandlers(
  server: Server,
  database: DatabaseConnection,
  logger: Logger,
  timeoutMs: number,
): void {
  let shuttingDown = false;

  const shutdown = (signal: NodeJS.Signals): void => {
    if (shuttingDown) return;
    shuttingDown = true;

    logger.info({ signal }, "graceful shutdown started");

    const forceCloseTimer = setTimeout(() => {
      logger.error({ timeoutMs }, "graceful shutdown timed out");
      server.closeAllConnections();
      process.exitCode = 1;
    }, timeoutMs);
    forceCloseTimer.unref();

    server.close((serverError) => {
      void database
        .disconnect()
        .then(() => {
          clearTimeout(forceCloseTimer);
          if (serverError) {
            logger.error({ err: serverError }, "server shutdown failed");
            process.exitCode = 1;
            return;
          }

          logger.info("graceful shutdown completed");
        })
        .catch((databaseError: unknown) => {
          clearTimeout(forceCloseTimer);
          logger.error({ err: databaseError }, "MongoDB shutdown failed");
          process.exitCode = 1;
        });
    });
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

const executedFile = process.argv[1] ? resolve(process.argv[1]) : undefined;
if (executedFile === fileURLToPath(import.meta.url)) {
  void startServer().catch((error: unknown) => {
    pino({ base: { service: "findbuddy-api" } }).fatal(
      { err: error },
      "FindBuddy API failed to start",
    );
    process.exitCode = 1;
  });
}
