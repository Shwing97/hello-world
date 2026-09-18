import type { MetadataRoute } from "next";
import { INDEXABLE } from "@/lib/site";

/**
 * Closed while we are on a temporary hosting subdomain - see the note in
 * app/layout.tsx. Set SITE_INDEXABLE=true when a permanent domain is in place.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: INDEXABLE
      ? { userAgent: "*", allow: "/" }
      : { userAgent: "*", disallow: "/" },
  };
}
