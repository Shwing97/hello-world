/**
 * Money is handled exclusively as integer cents.
 *
 * Commission reconciliation is an arithmetic product: a floating-point cent is a
 * wrong number shown to a customer, and a wrong number sent to a carrier is the
 * failure mode that ends the business. Nothing here returns a float.
 */

export type Cents = number;

const PAREN_NEGATIVE = /^\((.*)\)$/;
const NON_NUMERIC = /[^0-9.\-]/g;

/** Values carriers use to mean "nothing here". */
const BLANKS = new Set(["", "-", "--", "—", "–", "n/a", "na", "null", "none", "."]);

/**
 * Parse a monetary cell into integer cents.
 *
 * Handles `$1,234.56`, `(123.45)` and `123.45-` as negatives (both the accounting
 * and trailing-sign conventions carriers use for chargebacks), bare integers, and
 * the blank markers above. Returns null rather than 0 for absent values: a missing
 * commission and a zero commission are different findings.
 */
export function parseMoney(input: unknown): Cents | null {
  if (input === null || input === undefined) return null;
  if (typeof input === "number") {
    return Number.isFinite(input) ? Math.round(input * 100) : null;
  }

  let s = String(input).trim();
  if (BLANKS.has(s.toLowerCase())) return null;

  let negative = false;

  const paren = PAREN_NEGATIVE.exec(s);
  if (paren && paren[1] !== undefined) {
    negative = true;
    s = paren[1].trim();
  }

  // Trailing-sign convention, e.g. "123.45-"
  if (s.endsWith("-")) {
    negative = true;
    s = s.slice(0, -1).trim();
  }

  s = s.replace(NON_NUMERIC, "");
  if (s.startsWith("-")) {
    negative = true;
    s = s.slice(1);
  }
  s = s.replace(/-/g, "");

  if (s === "" || s === ".") return null;

  // Reject anything with more than one decimal point rather than guessing.
  const parts = s.split(".");
  if (parts.length > 2) return null;

  const whole = parts[0] ?? "0";
  const frac = (parts[1] ?? "").padEnd(2, "0").slice(0, 2);
  const value = Number(whole) * 100 + Number(frac);
  if (!Number.isFinite(value)) return null;

  return negative ? -value : value;
}

export function formatCents(c: Cents | null): string {
  if (c === null) return "";
  const negative = c < 0;
  const abs = Math.abs(c);
  const s = `${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, "0")}`;
  return negative ? `-${s}` : s;
}

export function sumCents(values: readonly (Cents | null)[]): Cents {
  return values.reduce<Cents>((acc, v) => acc + (v ?? 0), 0);
}

/**
 * Parse a commission rate into a decimal fraction (15% -> 0.15).
 *
 * Carriers write rates both ways in the same file family, so a bare number is
 * disambiguated by magnitude: values above 1 are treated as percentages. That is a
 * heuristic, and it is why `validateLines` re-checks rate x premium against the
 * reported commission rather than trusting this.
 */
export function parseRate(input: unknown): number | null {
  if (input === null || input === undefined) return null;
  const raw = String(input).trim();
  if (BLANKS.has(raw.toLowerCase())) return null;

  const isPercentLiteral = raw.includes("%");
  const cleaned = raw.replace(/[^0-9.\-]/g, "");
  if (cleaned === "" || cleaned === ".") return null;

  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;

  if (isPercentLiteral) return n / 100;
  return Math.abs(n) > 1 ? n / 100 : n;
}
