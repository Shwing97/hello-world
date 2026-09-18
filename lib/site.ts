/**
 * Site-wide flags.
 *
 * The site is deliberately not indexable while it runs on a temporary hosting
 * subdomain. Indexing a URL we intend to migrate away from creates a duplicate of
 * the eventual real domain and wastes what little authority a new site has. Set
 * SITE_INDEXABLE=true once a permanent domain is in place.
 */
export const INDEXABLE = process.env["SITE_INDEXABLE"] === "true";

export const SITE_NAME = "Statement Sweep";
