import type { Response } from "express";

import type { ApiSuccess } from "@findbuddy/contracts";

export function sendSuccess<T>(
  response: Response,
  data: T,
  options: {
    statusCode?: number;
    meta?: Record<string, unknown>;
  } = {},
): Response<ApiSuccess<T>> {
  const body: ApiSuccess<T> = {
    success: true,
    data,
    ...(options.meta ? { meta: options.meta } : {}),
  };

  return response.status(options.statusCode ?? 200).json(body);
}
