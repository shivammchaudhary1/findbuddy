import { randomUUID } from "node:crypto";

import type { RequestHandler } from "express";

const SAFE_REQUEST_ID = /^[A-Za-z0-9._:-]{1,128}$/;

export const requestId: RequestHandler = (request, response, next) => {
  const receivedRequestId = request.header("x-request-id");
  request.requestId =
    receivedRequestId && SAFE_REQUEST_ID.test(receivedRequestId)
      ? receivedRequestId
      : randomUUID();

  response.setHeader("x-request-id", request.requestId);
  next();
};
