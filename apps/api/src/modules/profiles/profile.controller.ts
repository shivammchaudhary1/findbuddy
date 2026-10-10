import type { Request, Response } from "express";

import {
  updateProfileRequestSchema,
  userIdParamsSchema,
} from "@findbuddy/validation";

import { sendSuccess } from "../../common/response/api-response.js";
import type { ProfileService } from "./profile.service.js";

export class ProfileController {
  constructor(private readonly profiles: ProfileService) {}

  getMe = async (request: Request, response: Response): Promise<void> => {
    const result = await this.profiles.getMe(request.auth!.userId);
    sendSuccess(response, result);
  };

  updateMe = async (request: Request, response: Response): Promise<void> => {
    const input = updateProfileRequestSchema.parse(request.body);
    const result = await this.profiles.updateMe(request.auth!.userId, input);
    sendSuccess(response, result);
  };

  getPublic = async (request: Request, response: Response): Promise<void> => {
    const { userId } = userIdParamsSchema.parse(request.params);
    const result = await this.profiles.getPublic(userId);
    sendSuccess(response, result);
  };
}
