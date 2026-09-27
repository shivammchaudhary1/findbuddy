import type { WebsiteData } from "@findbuddy/types";
export interface WebsiteDataAdapter {
  read(): WebsiteData;
}
export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
};
export type ApiError = {
  success: false;
  error: { code: string; message: string };
};
