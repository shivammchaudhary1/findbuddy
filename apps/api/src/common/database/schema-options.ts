import type { ClientSession, SchemaOptions } from "mongoose";

export const baseSchemaOptions = {
  strict: "throw",
  timestamps: true,
  versionKey: false,
} satisfies SchemaOptions;

export type RepositoryWriteOptions = {
  session?: ClientSession;
};

export function visibleStatusFilter<TStatus extends string>(
  visibleStatuses: readonly TStatus[],
): { status: { $in: TStatus[] } } {
  return { status: { $in: [...visibleStatuses] } };
}
