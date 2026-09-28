import { Writable } from "node:stream";

import { describe, expect, it } from "vitest";

import type { Environment } from "../src/config/env.js";
import { createLogger } from "../src/config/logger.js";

const environment = {
  nodeEnv: "test",
  logLevel: "info",
} as Environment;

describe("authentication log redaction", () => {
  it("redacts secrets at root and request-body boundaries", () => {
    let output = "";
    const destination = new Writable({
      write(chunk, _encoding, callback) {
        output += chunk.toString();
        callback();
      },
    });
    const logger = createLogger(environment, destination);

    logger.info({
      password: "plain-password",
      accessToken: "access-secret",
      refreshToken: "refresh-secret",
      req: {
        headers: { authorization: "Bearer secret", cookie: "secret-cookie" },
        body: { password: "nested-password", token: "action-secret" },
      },
    });

    expect(output).toContain("[REDACTED]");
    expect(output).not.toMatch(
      /plain-password|access-secret|refresh-secret|Bearer secret|secret-cookie|nested-password|action-secret/,
    );
  });
});
