import type { WebsiteData } from "@findbuddy/types";

export interface WebsiteDataAdapter {
  read(): WebsiteData;
}
