const TEST_DATABASE_NAME = /(?:^|[-_])test(?:[-_]|$)/i;

export function assertTestDatabaseUri(uri: string): string {
  let parsed: URL;

  try {
    parsed = new URL(uri);
  } catch {
    throw new Error("TEST_MONGODB_URI must be a valid MongoDB URI");
  }

  if (parsed.protocol !== "mongodb:" && parsed.protocol !== "mongodb+srv:") {
    throw new Error("TEST_MONGODB_URI must use mongodb:// or mongodb+srv://");
  }

  const databaseName = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  if (!databaseName || !TEST_DATABASE_NAME.test(databaseName)) {
    throw new Error(
      "TEST_MONGODB_URI database name must contain an isolated test segment",
    );
  }

  return uri;
}

export function readTestDatabaseUri(
  source: Record<string, string | undefined> = process.env,
): string | undefined {
  const uri = source.TEST_MONGODB_URI;
  return uri ? assertTestDatabaseUri(uri) : undefined;
}
