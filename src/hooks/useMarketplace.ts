import { MARKETPLACE_SERVERS, CATEGORIES } from "../data/marketplace";

export function useMarketplace() {
  return { servers: MARKETPLACE_SERVERS, categories: CATEGORIES };
}
