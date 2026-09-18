/**
 * Post-parse validation.
 *
 * The governing rule of this product: we would rather show nothing than show a
 * wrong number. Every check here exists to make a bad parse loud instead of quiet.
 */

import { parseMoney, type Cents } from "./money";
import type { CanonicalLine } from "./schema";

export type IssueSeverity = "error" | "warning" | "info";

export interface Issue {
  severity: IssueSeverity;
  code: string;
  message: string;
  row?: number;
}

/** Tolerance for arithmetic cross-checks: the greater of $1.00 or 2%. */
function tolerance(expected: Cents): Cents {
  return Math.max(100, Math.round(Math.abs(expected) * 0.02));
}

/**
 * Pull a declared total out of the rows around the data, so line items can be
 * checked against the carrier's own arithmetic.
 */
export function findDeclaredTotal(rows: readonly (readonly string[])[]): Cents | null {
  for (let i = rows.length - 1; i >= 0; i -= 1) {
    const row = rows[i];
    if (!row) continue;

    const hasTotalLabel = row.some((c) => /\btotals?\b/i.test((c ?? "").trim()));
    if (!hasTotalLabel) continue;

    const amounts = row
      .map((c) => parseMoney(c))
      .filter((v): v is Cents => v !== null);

    if (amounts.length > 0) return amounts[amounts.length - 1] ?? null;
  }
  return null;
}

export interface ValidationResult {
  issues: Issue[];
  lineTotal: Cents;
  declaredTotal: Cents | null;
  totalsAgree: boolean | null;
}

export function validateLines(
  lines: readonly CanonicalLine[],
  declaredTotal: Cents | null,
): ValidationResult {
  const issues: Issue[] = [];

  let lineTotal = 0;
  let ambiguousDates = 0;
  const seen = new Map<string, number>();

  for (const line of lines) {
    if (line.policyNumber === "") {
      issues.push({
        severity: "error",
        code: "MISSING_POLICY_NUMBER",
        message: "Line has no policy number and cannot be matched to a book of business.",
        row: line.sourceRow,
      });
    }

    if (line.commissionCents === null) {
      issues.push({
        severity: "error",
        code: "MISSING_COMMISSION",
        message: "Line has no readable commission amount.",
        row: line.sourceRow,
      });
    } else {
      lineTotal += line.commissionCents;
    }

    // Cross-check the carrier's own arithmetic where all three numbers exist.
    if (
      line.premiumCents !== null &&
      line.commissionRate !== null &&
      line.commissionCents !== null &&
      line.premiumCents !== 0
    ) {
      const expected = Math.round(line.premiumCents * line.commissionRate);
      if (Math.abs(expected - line.commissionCents) > tolerance(expected)) {
        issues.push({
          severity: "warning",
          code: "RATE_MISMATCH",
          message:
            "Premium x rate does not equal the commission shown. The rate column may have been read incorrectly, or the carrier applied an adjustment.",
          row: line.sourceRow,
        });
      }
    }

    if (line.effectiveDateAmbiguous) ambiguousDates += 1;

    const key = `${line.policyNumber}|${line.effectiveDate ?? ""}|${line.commissionCents ?? ""}`;
    if (line.policyNumber !== "") {
      const prior = seen.get(key);
      if (prior !== undefined) {
        issues.push({
          severity: "info",
          code: "DUPLICATE_LINE",
          message: `Identical to row ${prior}. This may be a genuine duplicate payment, or the statement may legitimately repeat the line.`,
          row: line.sourceRow,
        });
      } else {
        seen.set(key, line.sourceRow);
      }
    }
  }

  if (ambiguousDates > 0) {
    issues.push({
      severity: "warning",
      code: "AMBIGUOUS_DATE",
      message: `${ambiguousDates} date${ambiguousDates === 1 ? "" : "s"} could be read as either MM/DD or DD/MM. US convention was assumed - check these before relying on them.`,
    });
  }

  let totalsAgree: boolean | null = null;
  if (declaredTotal !== null) {
    totalsAgree = Math.abs(declaredTotal - lineTotal) <= tolerance(declaredTotal);
    if (!totalsAgree) {
      issues.push({
        severity: "error",
        code: "TOTAL_MISMATCH",
        message:
          "Line items do not add up to the total printed on the statement. Some rows were probably missed or misread - do not rely on this conversion.",
      });
    }
  }

  return { issues, lineTotal, declaredTotal, totalsAgree };
}
