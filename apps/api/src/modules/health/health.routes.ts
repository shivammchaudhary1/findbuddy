import { Router } from "express";

import { sendSuccess } from "../../common/response/api-response.js";

export type ReadinessResult = {
  ready: boolean;
  checks: Record<string, "ready" | "not_ready">;
};

export type ReadinessCheck = () => Promise<ReadinessResult>;

const defaultReadinessCheck: ReadinessCheck = async () => ({
  ready: true,
  checks: { api: "ready" },
});

export function createHealthRouter(
  readinessCheck: ReadinessCheck = defaultReadinessCheck,
): Router {
  const router = Router();

  router.get("/live", (_request, response) =>
    sendSuccess(response, {
      status: "alive" as const,
      timestamp: new Date().toISOString(),
    }),
  );

  router.get("/ready", async (_request, response) => {
    let readiness: ReadinessResult;

    try {
      readiness = await readinessCheck();
    } catch {
      readiness = {
        ready: false,
        checks: { api: "ready", dependency: "not_ready" },
      };
    }

    return sendSuccess(
      response,
      {
        status: readiness.ready ? ("ready" as const) : ("not_ready" as const),
        checks: readiness.checks,
        timestamp: new Date().toISOString(),
      },
      { statusCode: readiness.ready ? 200 : 503 },
    );
  });

  return router;
}
