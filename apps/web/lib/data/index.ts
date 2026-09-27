import source from "../../../../data/website-data.json";
import { websiteSchema } from "@findbuddy/validation";
import type { WebsiteDataAdapter } from "@findbuddy/contracts";
import type { WebsiteData } from "@findbuddy/types";

const parsed: WebsiteData = websiteSchema.parse(source);
export const jsonAdapter: WebsiteDataAdapter = { read: () => parsed };
export function getWebsiteData(): WebsiteData {
  return jsonAdapter.read();
}

export function getSiteContent(): WebsiteData["site"] {
  return getWebsiteData().site;
}
