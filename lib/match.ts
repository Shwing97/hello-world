/**
 * The matching cascade: statement lines against the agency's own book.
 *
 * Converting a statement is the free tool. This is the product. An agency needs to
 * know which of the lines a carrier paid correspond to policies it actually owns,
 * and — the finding that pays for the subscription — which policies the carrier
 * did not pay at all.
 *
 * The governing rule from `validate.ts` applies with more force here. A wrong
 * match is worse than no match: it produces a confident, specific, wrong claim
 * against a carrier. Every tier below is therefore allowed to refuse. When a line
 * has several plausible book policies and nothing separates them, it is reported
 * as ambiguous for a human to settle, never resolved by picking the first.
 */

import type { Cents } from "./money";
import { normalizeInsuredName, normalizePolicyNumber } from "./normalize";
import type { CanonicalLine } from "./schema";
import type { Issue } from "./validate";

/**
 * One policy as it appears in the agency's management system export.
 *
 * `commissionRate` is the *contracted* rate — what the carrier agreed to pay —
 * which is the number the statement is checked against. It is not the rate printed
 * on the statement; that one is what we are auditing.
 */
export interface BookPolicy {
  rowId: number;
  policyNumberRaw: string;
  policyNumber: string;
  insuredNameRaw: string;
  insuredName: string;
  insuredNameSorted: string;
  premiumCents: Cents | null;
  commissionRate: number | null;
  effectiveDate: string | null;
  lineOfBusiness: string | null;
}

export type MatchTier =
  | "policy-exact"
  | "policy-plus-name"
  | "name-plus-premium"
  | "name-plus-effective-date";

/**
 * How much weight a downstream claim against a carrier may carry.
 *
 * Only policy-number tiers are "high". A name-based match is good enough to show
 * an agency, and not good enough to dispute money on without a human looking.
 */
export type MatchConfidence = "high" | "medium";

const TIER_CONFIDENCE: Record<MatchTier, MatchConfidence> = {
  "policy-exact": "high",
  "policy-plus-name": "high",
  "name-plus-premium": "medium",
  "name-plus-effective-date": "medium",
};

export interface MatchedPair {
  line: CanonicalLine;
  policy: BookPolicy;
  tier: MatchTier;
  confidence: MatchConfidence;
}

export interface AmbiguousMatch {
  line: CanonicalLine;
  candidates: readonly BookPolicy[];
  /** Which tier produced the tie, so the UI can explain what to disambiguate. */
  tier: MatchTier;
  message: string;
}

export interface MatchReport {
  matched: readonly MatchedPair[];
  /** Lines with more than one plausible policy. Deliberately unresolved. */
  ambiguous: readonly AmbiguousMatch[];
  /** Statement lines with no book policy: paid for something not in the book. */
  unmatchedLines: readonly CanonicalLine[];
  /** Book policies no statement line touched: the not-paid-at-all candidates. */
  unmatchedPolicies: readonly BookPolicy[];
  issues: readonly Issue[];
}

/**
 * Tolerance for treating two premiums as the same policy: the greater of $1.00
 * or 1%.
 *
 * Tighter than the arithmetic check in `validate.ts` (2%), because here the number
 * is being used as an identifier rather than cross-footed. Endorsements move
 * premium by more than this, which is why premium is only ever a tie-breaker
 * alongside a name and never a match criterion on its own.
 */
function premiumWithinTolerance(a: Cents, b: Cents): boolean {
  const tolerance = Math.max(100, Math.round(Math.abs(a) * 0.01));
  return Math.abs(a - b) <= tolerance;
}

/**
 * Build a `BookPolicy` from a raw management-system row.
 *
 * Normalisation happens here and only here, so book rows and statement lines are
 * always compared on forms produced by the same code.
 */
export function toBookPolicy(
  row: {
    policyNumber?: unknown;
    insuredName?: unknown;
    premiumCents?: Cents | null;
    commissionRate?: number | null;
    effectiveDate?: string | null;
    lineOfBusiness?: string | null;
  },
  rowId: number,
): BookPolicy {
  const policy = normalizePolicyNumber(row.policyNumber);
  const name = normalizeInsuredName(row.insuredName);

  return {
    rowId,
    policyNumberRaw: policy.raw,
    policyNumber: policy.norm,
    insuredNameRaw: name.raw,
    insuredName: name.norm,
    insuredNameSorted: name.sorted,
    premiumCents: row.premiumCents ?? null,
    commissionRate: row.commissionRate ?? null,
    effectiveDate: row.effectiveDate ?? null,
    lineOfBusiness: row.lineOfBusiness ?? null,
  };
}

/** Group policies by a key, skipping blanks so empty strings never collide. */
function indexBy(
  policies: readonly BookPolicy[],
  key: (p: BookPolicy) => string,
): Map<string, BookPolicy[]> {
  const index = new Map<string, BookPolicy[]>();
  for (const policy of policies) {
    const k = key(policy);
    if (k === "") continue;
    const bucket = index.get(k);
    if (bucket) bucket.push(policy);
    else index.set(k, [policy]);
  }
  return index;
}

/**
 * Reconcile statement lines against a book.
 *
 * Runs as a cascade: every line gets a shot at the strongest tier before any line
 * is offered a weaker one, so a confident policy-number match always wins a book
 * policy ahead of a speculative name match. Matching is one-to-one — a book policy
 * claimed by one line is withdrawn from the pool — because a carrier paying the
 * same policy twice in one statement is a finding, not something to quietly
 * collapse.
 */
export function matchStatementToBook(
  lines: readonly CanonicalLine[],
  book: readonly BookPolicy[],
): MatchReport {
  const matched: MatchedPair[] = [];
  const ambiguous: AmbiguousMatch[] = [];
  const issues: Issue[] = [];

  const claimed = new Set<number>();
  const resolved = new Set<number>();

  const byPolicy = indexBy(book, (p) => p.policyNumber);
  const byName = indexBy(book, (p) => p.insuredNameSorted);

  const available = (candidates: readonly BookPolicy[] | undefined): BookPolicy[] =>
    (candidates ?? []).filter((p) => !claimed.has(p.rowId));

  const take = (line: CanonicalLine, policy: BookPolicy, tier: MatchTier): void => {
    claimed.add(policy.rowId);
    resolved.add(line.sourceRow);
    matched.push({ line, policy, tier, confidence: TIER_CONFIDENCE[tier] });
  };

  const refuse = (
    line: CanonicalLine,
    candidates: readonly BookPolicy[],
    tier: MatchTier,
    message: string,
  ): void => {
    resolved.add(line.sourceRow);
    ambiguous.push({ line, candidates, tier, message });
  };

  // Tier 1/2 — policy number. The only identifier both sides intend to be one.
  for (const line of lines) {
    if (resolved.has(line.sourceRow) || line.policyNumber === "") continue;

    const candidates = available(byPolicy.get(line.policyNumber));
    if (candidates.length === 0) continue;

    if (candidates.length === 1 && candidates[0]) {
      take(line, candidates[0], "policy-exact");
      continue;
    }

    // Same policy number on several book rows. Usually a renewal history. The
    // insured name is the only thing that can separate them without guessing.
    const byInsured = candidates.filter(
      (p) => line.insuredNameSorted !== "" && p.insuredNameSorted === line.insuredNameSorted,
    );

    if (byInsured.length === 1 && byInsured[0]) {
      take(line, byInsured[0], "policy-plus-name");
      continue;
    }

    refuse(
      line,
      candidates,
      "policy-plus-name",
      `Policy number ${line.policyNumberRaw} appears on ${candidates.length} book rows and the insured name does not single one out.`,
    );
  }

  // Tier 3 — insured name plus premium. For statements that print no usable
  // policy number, or print one the agency never recorded.
  for (const line of lines) {
    if (resolved.has(line.sourceRow) || line.insuredNameSorted === "") continue;
    if (line.premiumCents === null) continue;

    const candidates = available(byName.get(line.insuredNameSorted));
    if (candidates.length === 0) continue;

    const premium = line.premiumCents;
    const near = candidates.filter(
      (p) => p.premiumCents !== null && premiumWithinTolerance(premium, p.premiumCents),
    );

    if (near.length === 1 && near[0]) {
      take(line, near[0], "name-plus-premium");
      continue;
    }

    if (near.length > 1) {
      refuse(
        line,
        near,
        "name-plus-premium",
        `${line.insuredNameRaw} has ${near.length} book policies at this premium; policy number is needed to tell them apart.`,
      );
    }
  }

  // Tier 4 — insured name plus effective date, for lines carrying no premium.
  for (const line of lines) {
    if (resolved.has(line.sourceRow) || line.insuredNameSorted === "") continue;
    if (line.effectiveDate === null) continue;

    // A date we already know we guessed is not evidence of identity.
    if (line.effectiveDateAmbiguous) continue;

    const candidates = available(byName.get(line.insuredNameSorted));
    if (candidates.length === 0) continue;

    const sameDate = candidates.filter((p) => p.effectiveDate === line.effectiveDate);

    if (sameDate.length === 1 && sameDate[0]) {
      take(line, sameDate[0], "name-plus-effective-date");
      continue;
    }

    if (sameDate.length > 1) {
      refuse(
        line,
        sameDate,
        "name-plus-effective-date",
        `${line.insuredNameRaw} has ${sameDate.length} book policies effective ${line.effectiveDate}.`,
      );
    }
  }

  const unmatchedLines = lines.filter((l) => !resolved.has(l.sourceRow));
  const unmatchedPolicies = book.filter((p) => !claimed.has(p.rowId));

  if (ambiguous.length > 0) {
    issues.push({
      severity: "warning",
      code: "AMBIGUOUS_MATCH",
      message: `${ambiguous.length} statement line(s) matched more than one book policy and were left for review rather than assigned.`,
    });
  }

  if (unmatchedLines.length > 0) {
    issues.push({
      severity: "warning",
      code: "UNMATCHED_STATEMENT_LINE",
      message: `${unmatchedLines.length} statement line(s) have no policy in the book. The carrier paid on something the book does not contain.`,
    });
  }

  return { matched, ambiguous, unmatchedLines, unmatchedPolicies, issues };
}
