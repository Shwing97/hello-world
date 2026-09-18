/**
 * Carrier identification from the filename and the statement preamble.
 *
 * Identification is a convenience, not a dependency: parsing works without it,
 * because profiles are keyed by header fingerprint. Knowing the carrier improves
 * the telemetry and the eventual per-carrier SEO pages.
 */

export interface Carrier {
  id: string;
  name: string;
  aliases: readonly string[];
}

/**
 * Seed list. This grows from real uploads - the long tail of regional and
 * specialty carriers is exactly what a horizontal tool has no reason to learn.
 */
export const SEED_CARRIERS: readonly Carrier[] = [
  { id: "travelers", name: "Travelers", aliases: ["travelers", "travellers"] },
  { id: "progressive", name: "Progressive", aliases: ["progressive"] },
  { id: "nationwide", name: "Nationwide", aliases: ["nationwide"] },
  { id: "safeco", name: "Safeco", aliases: ["safeco"] },
  { id: "hartford", name: "The Hartford", aliases: ["hartford"] },
  { id: "liberty-mutual", name: "Liberty Mutual", aliases: ["liberty mutual", "libertymutual"] },
  { id: "erie", name: "Erie Insurance", aliases: ["erie"] },
  { id: "auto-owners", name: "Auto-Owners", aliases: ["auto owners", "autoowners"] },
  { id: "chubb", name: "Chubb", aliases: ["chubb"] },
  { id: "foremost", name: "Foremost", aliases: ["foremost"] },
  { id: "grange", name: "Grange Insurance", aliases: ["grange"] },
  { id: "encompass", name: "Encompass", aliases: ["encompass"] },
  { id: "cincinnati", name: "Cincinnati Insurance", aliases: ["cincinnati"] },
  { id: "westfield", name: "Westfield", aliases: ["westfield"] },
  { id: "selective", name: "Selective", aliases: ["selective"] },
  { id: "kemper", name: "Kemper", aliases: ["kemper"] },
  { id: "hanover", name: "The Hanover", aliases: ["hanover"] },
  { id: "amtrust", name: "AmTrust", aliases: ["amtrust", "am trust"] },
  { id: "biberk", name: "biBERK", aliases: ["biberk"] },
  { id: "state-auto", name: "State Auto", aliases: ["state auto", "stateauto"] },
];

export interface CarrierMatch {
  carrier: Carrier;
  confidence: number;
  source: "filename" | "content";
}

export function detectCarrier(
  filename: string,
  preambleText: string,
  carriers: readonly Carrier[] = SEED_CARRIERS,
): CarrierMatch | null {
  const haystackFile = filename.toLowerCase().replace(/[^a-z0-9 ]+/g, " ");
  const haystackContent = preambleText.toLowerCase().replace(/[^a-z0-9 ]+/g, " ");

  for (const carrier of carriers) {
    for (const alias of carrier.aliases) {
      if (haystackFile.includes(alias)) {
        return { carrier, confidence: 0.9, source: "filename" };
      }
    }
  }

  for (const carrier of carriers) {
    for (const alias of carrier.aliases) {
      if (haystackContent.includes(alias)) {
        return { carrier, confidence: 0.75, source: "content" };
      }
    }
  }

  return null;
}
