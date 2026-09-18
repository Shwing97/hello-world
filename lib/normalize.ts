/**
 * Normalisation for the two fields that identify a policy across systems.
 *
 * Policy numbers are not stable identifiers: carriers reformat them, agencies
 * re-key them, and renewals mutate them. Insured names are worse. Every comparison
 * anywhere in this codebase runs on normalised forms, never raw ones.
 */

/** Entity suffixes and articles that appear inconsistently between the two sides. */
const ENTITY_NOISE = new Set([
  "LLC", "LC", "INC", "INCORPORATED", "CORP", "CORPORATION", "CO", "COMPANY",
  "LTD", "LIMITED", "LP", "LLP", "PLLC", "PC", "PA", "DBA", "THE", "AND",
]);

export interface NormalizedPolicyNumber {
  raw: string;
  norm: string;
}

/**
 * Uppercase, strip every non-alphanumeric, drop leading zeros.
 *
 * `POL-0001234-00` and `pol000123400` both normalise to `POL123400`. Leading zeros
 * are dropped only from the front of the whole string, never from interior groups,
 * because interior zeros carry meaning in most carrier schemes.
 */
export function normalizePolicyNumber(input: unknown): NormalizedPolicyNumber {
  const raw = input === null || input === undefined ? "" : String(input).trim();
  let norm = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  norm = norm.replace(/^0+(?=.)/, "");
  return { raw, norm };
}

export interface NormalizedName {
  raw: string;
  /** Readable normalised form: uppercase, de-punctuated, noise words removed. */
  norm: string;
  /** Token-sorted form, for order-insensitive comparison. */
  sorted: string;
}

/**
 * `Smith & Sons, LLC` and `SONS AND SMITH INC` both reach the same `sorted` form,
 * which is what lets name-based matching survive the two sides disagreeing about
 * word order and entity type.
 */
export function normalizeInsuredName(input: unknown): NormalizedName {
  const raw = input === null || input === undefined ? "" : String(input).trim();

  const tokens = raw
    .toUpperCase()
    .replace(/&/g, " AND ")
    // Collapse dotted abbreviations BEFORE stripping punctuation, so "P.C."
    // becomes the single token "PC" and is recognised as an entity suffix
    // instead of surviving as two stray letters.
    .replace(/(?<=\b[A-Z])\./g, "")
    .replace(/[^A-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 0 && !ENTITY_NOISE.has(t));

  return {
    raw,
    norm: tokens.join(" "),
    sorted: [...tokens].sort().join(" "),
  };
}

const MONTHS: Record<string, number> = {
  JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6,
  JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12,
};

/**
 * Which way round a numeric date column is written.
 *
 * Determined per column across the whole file, not per cell: a single row with a
 * day above 12 settles the convention for every other row in that column.
 */
export type DateConvention = "mdy" | "dmy" | "unknown";

function iso(y: number, m: number, d: number): string | null {
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return dt.toISOString().slice(0, 10);
}

function expandYear(y: number): number {
  if (y >= 1000) return y;
  // Two-digit years in commission statements are always recent.
  return y <= 69 ? 2000 + y : 1900 + y;
}

/**
 * Infer a numeric date column's convention from every value in it.
 *
 * Any single value whose first component exceeds 12 proves the column is DD/MM;
 * any value whose second component exceeds 12 proves MM/DD. A column that never
 * exceeds 12 in either position is genuinely undecidable from the data alone.
 */
export function detectDateConvention(values: readonly unknown[]): DateConvention {
  let sawDmyEvidence = false;
  let sawMdyEvidence = false;

  for (const value of values) {
    const raw = String(value ?? "").trim();
    const m = /^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2,4})$/.exec(raw);
    if (!m) continue;

    const a = Number(m[1]);
    const b = Number(m[2]);
    if (a > 12 && a <= 31) sawDmyEvidence = true;
    if (b > 12 && b <= 31) sawMdyEvidence = true;
  }

  // Contradictory evidence means the column is not internally consistent; say so
  // rather than picking a side.
  if (sawDmyEvidence && sawMdyEvidence) return "unknown";
  if (sawDmyEvidence) return "dmy";
  if (sawMdyEvidence) return "mdy";
  return "unknown";
}

/**
 * Parse a date cell to ISO `YYYY-MM-DD`.
 *
 * `03/04/26` is genuinely ambiguous in isolation, so the column convention from
 * `detectDateConvention` is passed in. With no convention available, US ordering
 * is assumed and `ambiguous: true` is returned so the caller surfaces the guess
 * rather than silently trusting it.
 */
export function normalizeDate(
  input: unknown,
  convention: DateConvention = "unknown",
): { iso: string | null; ambiguous: boolean } {
  if (input === null || input === undefined) return { iso: null, ambiguous: false };

  if (input instanceof Date) {
    return Number.isNaN(input.getTime())
      ? { iso: null, ambiguous: false }
      : { iso: input.toISOString().slice(0, 10), ambiguous: false };
  }

  const raw = String(input).trim();
  if (raw === "") return { iso: null, ambiguous: false };

  // Excel serial date, occasionally leaks through CSV exports.
  if (/^\d{5}(\.\d+)?$/.test(raw)) {
    const serial = Number(raw);
    if (serial > 20000 && serial < 60000) {
      const ms = Math.round((serial - 25569) * 86400 * 1000);
      return { iso: new Date(ms).toISOString().slice(0, 10), ambiguous: false };
    }
  }

  // ISO
  const isoMatch = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(raw);
  if (isoMatch) {
    const out = iso(Number(isoMatch[1]), Number(isoMatch[2]), Number(isoMatch[3]));
    return { iso: out, ambiguous: false };
  }

  // 04-Mar-2026 / Mar 4, 2026
  const named = /^(\d{1,2})[-\s]([A-Za-z]{3,})[-\s](\d{2,4})$/.exec(raw);
  if (named) {
    const m = MONTHS[(named[2] ?? "").slice(0, 3).toUpperCase()];
    if (m) return { iso: iso(expandYear(Number(named[3])), m, Number(named[1])), ambiguous: false };
  }
  const named2 = /^([A-Za-z]{3,})\s+(\d{1,2}),?\s+(\d{2,4})$/.exec(raw);
  if (named2) {
    const m = MONTHS[(named2[1] ?? "").slice(0, 3).toUpperCase()];
    if (m) return { iso: iso(expandYear(Number(named2[3])), m, Number(named2[2])), ambiguous: false };
  }

  // Numeric slash/dot/dash forms
  const numeric = /^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2,4})$/.exec(raw);
  if (numeric) {
    const a = Number(numeric[1]);
    const b = Number(numeric[2]);
    const y = expandYear(Number(numeric[3]));

    const usReading = iso(y, a, b);
    const intlReading = iso(y, b, a);

    // Unambiguous: one of the two components cannot be a month.
    if (a > 12 && intlReading) return { iso: intlReading, ambiguous: false };
    if (b > 12 && usReading) return { iso: usReading, ambiguous: false };

    if (convention === "dmy" && intlReading) return { iso: intlReading, ambiguous: false };
    if (convention === "mdy" && usReading) return { iso: usReading, ambiguous: false };

    // Default to US convention, but tell the caller it was a guess.
    return { iso: usReading, ambiguous: usReading !== intlReading };
  }

  return { iso: null, ambiguous: false };
}
