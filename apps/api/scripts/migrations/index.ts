import type { DatabaseMigration } from "../../src/common/database/migrations.js";
import { authIndexesMigration } from "./001-auth-indexes.js";
import { profileMediaIndexesMigration } from "./002-profile-media-indexes.js";

export const registeredMigrations: readonly DatabaseMigration[] = [
  authIndexesMigration,
  profileMediaIndexesMigration,
];
