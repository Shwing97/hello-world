/**
 * The carrier profile library - the compounding asset.
 *
 * Profiles are keyed by a fingerprint of the header row, not by carrier name. That
 * matters: it means a layout is recognised on sight even when the carrier was
 * never identified, and one carrier can have several layouts (personal lines vs
 * commercial, monthly vs supplemental) without them colliding.
 *
 * Profiles store STRUCTURE ONLY - column positions and header text. No customer
 * values ever enter this store. That constraint is what makes a library shared
 * across every tenant legitimate, so it is enforced here in code rather than left
 * to policy: see `assertStructureOnly`.
 */

import { createHash } from "node:crypto";
import type { ColumnMap } from "./induce";

export interface StoredProfile {
  fingerprint: string;
  carrierId: string | null;
  format: "csv" | "xlsx" | "pdf";
  columnMap: ColumnMap;
  headers: string[];
  confidence: number;
  method: "heuristic" | "llm";
  sampleCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Stable across cosmetic differences (case, punctuation, column order) but not
 * across an actually different layout.
 */
export function fingerprintHeaders(headers: readonly string[]): string {
  const normalized = headers
    .map((h) => (h ?? "").toLowerCase().replace(/[^a-z0-9]+/g, ""))
    .filter((h) => h !== "")
    .sort();
  return createHash("sha256").update(normalized.join("|")).digest("hex").slice(0, 16);
}

/**
 * Guard against customer data leaking into the shared library.
 *
 * Header text is structural and is kept. Anything that looks like a value - a
 * money amount, a date, a long digit run - means we fingerprinted a data row by
 * mistake, and that profile must not be stored.
 */
export function assertStructureOnly(profile: StoredProfile): void {
  const suspicious = profile.headers.filter((h) => {
    const s = h.trim();
    if (s === "") return false;
    return /^[($]?-?[\d,]+(\.\d{2})?\)?$/.test(s) || /\d{5,}/.test(s) || /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(s);
  });

  if (suspicious.length > 0) {
    throw new Error(
      `Refusing to store profile: headers look like data, not structure (${suspicious.slice(0, 3).join(", ")})`,
    );
  }
}

export interface ProfileStore {
  get(fingerprint: string): Promise<StoredProfile | null>;
  put(profile: StoredProfile): Promise<void>;
  count(): Promise<number>;
}

export class MemoryProfileStore implements ProfileStore {
  private readonly profiles = new Map<string, StoredProfile>();

  async get(fingerprint: string): Promise<StoredProfile | null> {
    return this.profiles.get(fingerprint) ?? null;
  }

  async put(profile: StoredProfile): Promise<void> {
    assertStructureOnly(profile);
    const existing = this.profiles.get(profile.fingerprint);
    this.profiles.set(profile.fingerprint, {
      ...profile,
      sampleCount: (existing?.sampleCount ?? 0) + 1,
      createdAt: existing?.createdAt ?? profile.createdAt,
      updatedAt: new Date().toISOString(),
    });
  }

  async count(): Promise<number> {
    return this.profiles.size;
  }
}
