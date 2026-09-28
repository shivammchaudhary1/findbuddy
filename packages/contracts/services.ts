import type {
  CreateServiceRequest,
  PublicServiceDto,
  ServiceListQuery,
  UpdateServiceRequest,
} from "@findbuddy/types";

import type { ApiSuccess, PaginatedApiSuccess } from "./api";

export type CreateServiceBody = CreateServiceRequest;
export type UpdateServiceBody = UpdateServiceRequest;
export type ListServicesQuery = ServiceListQuery;
export type CreateServiceResponse = ApiSuccess<PublicServiceDto>;
export type GetServiceResponse = ApiSuccess<PublicServiceDto>;
export type ListServicesResponse = PaginatedApiSuccess<PublicServiceDto>;
