import type { Request, Response } from "express";

import {
  mediaIdParamsSchema,
  mediaPresignRequestSchema,
} from "@findbuddy/validation";

import { sendSuccess } from "../../common/response/api-response.js";
import type { MediaService } from "./media.service.js";

export class MediaController {
  constructor(private readonly media: MediaService) {}

  presign = async (request: Request, response: Response): Promise<void> => {
    const input = mediaPresignRequestSchema.parse(request.body);
    const result = await this.media.presign(request.auth!.userId, input);
    sendSuccess(response, result, { statusCode: 201 });
  };

  confirm = async (request: Request, response: Response): Promise<void> => {
    const { mediaId } = mediaIdParamsSchema.parse(request.params);
    const result = await this.media.confirm(request.auth!.userId, mediaId);
    sendSuccess(response, result);
  };
}
