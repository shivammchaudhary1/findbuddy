import type { z } from "zod";

import type {
  createPlanRequestSchema,
  createServiceRequestSchema,
  mediaPresignRequestSchema,
  paginationQuerySchema,
  publicProfileSchema,
  privateProfileSchema,
  publicServiceSchema,
  publicTrustSummarySchema,
  serviceListQuerySchema,
  updateProfileRequestSchema,
  updateServiceRequestSchema,
} from "@findbuddy/validation";
import type {
  pricingTypes,
  servicePricingErrorCodes,
  subscriptionStatuses,
} from "@findbuddy/constants";

export type PricingType = (typeof pricingTypes)[number];
export type SubscriptionStatus = (typeof subscriptionStatuses)[number];
export type ServicePricingErrorCode = (typeof servicePricingErrorCodes)[number];

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type ServiceListQuery = z.infer<typeof serviceListQuerySchema>;
export type CreateServiceRequest = z.infer<typeof createServiceRequestSchema>;
export type UpdateServiceRequest = z.infer<typeof updateServiceRequestSchema>;
export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>;
export type PrivateProfileDto = z.infer<typeof privateProfileSchema>;
export type MediaPresignRequest = z.infer<typeof mediaPresignRequestSchema>;
export type CreatePlanRequest = z.infer<typeof createPlanRequestSchema>;

export type PublicProfileDto = z.infer<typeof publicProfileSchema>;
export type PublicServiceDto = z.infer<typeof publicServiceSchema>;
export type PublicTrustSummaryDto = z.infer<typeof publicTrustSummarySchema>;

export type MediaPresignDto = {
  mediaId: string;
  uploadUrl: string;
  objectKey: string;
  expiresInSeconds: number;
  requiredHeaders: { "content-type": string };
};

export type MediaDto = {
  id: string;
  kind: "PROFILE_IMAGE";
  status: "ACTIVE";
  url: string;
};

export type SubscriptionEntitlement = {
  status: SubscriptionStatus;
  currentPeriodEnd?: string | Date;
};

export type ServicePricingInput = {
  isPro: boolean;
  pricingType: PricingType;
  price: number;
};

export type ServicePricingValidation =
  | { valid: true }
  | {
      valid: false;
      code: ServicePricingErrorCode;
      message: string;
    };
