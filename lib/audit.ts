/**
 * The audit: what a matched line should have paid, against what it did pay.
 *
 * This is the output the agency is buying. Underpayment is silent — a carrier that
 * pays 10% on a policy contracted at 15% produces a statement that looks entirely
 * normal, and the agency has no way to see it without doing exactly this
 * arithmetic on every line of every statement.
 *
 * Every number here is integer cents, and every finding carries the inputs it was
 * derived from, because an agency taking a variance to a carrier will be asked
 * where the figure came from.
 */

import { type Cents } from "./money";
import type { BookPolicy, MatchReport, MatchedPair } from "./match";
import type { CanonicalLine } from "./schema";

export type FindingCode =
  | "UNDERPAID"
  | "OVERPAID"
  | "NOT_PAID"
  | "RATE_MISMATCH"
  | "PREMIUM_MISMATCH"
  | "NO_EXPECTATION";

export interface Finding {
  code: FindingCode;
  /** Absent for NOT_PAID: there is no statement line, which is the point. */
  line: CanonicalLine | null;
  policy: BookPolicy;
  /** What the book says the carrier owed. Null when it could not be computed. */
  expectedCents: Cents | null;
  /** What the statement actually paid. Null when the carrier paid nothing. */
  paidCents: Cents | null;
  /** paid - expected. Negative is money owed to the agency. */
  varianceCents: Cents | null;
  /**
   * Whether the variance clears the noise floor. Immaterial findings are still
   * returned — a systematic one-cent shortfall across 4,000 lines is a real
   * finding — but they are not what the agency is shown first.
   */
  material: boolean;
  message: string;
}

export interface AuditReport {
  findings: readonly Finding[];
  /** Net of every material variance. Negative means the carrier is behind. */
  netVarianceCents: Cents;
  /** Sum of material shortfalls only, ignoring overpayments that offset them. */
  totalUnderpaidCents: Cents;
  /** Book policies with no statement line at all, in cents of expected commission. */
  totalNotPaidCents: Cents;
  /** Lines that could not be checked, because the book lacks premium or rate. */
  uncheckedCount: number;
}

/**
 * The noise floor: the greater of $1.00 or 1% of the expected commission.
 *
 * Carriers round per line and occasionally compute on a marginally different
 * premium basis, so sub-dollar variances are not worth an agency's phone call.
 * The exact variance is reported on every finding regardless of this threshold —
 * the flag decides presentation order, never whether a number is disclosed.
 */
function materialityFloor(expected: Cents): Cents {
  return Math.max(100, Math.round(Math.abs(expected) * 0.01));
}

/**
 * Expected commission in integer cents.
 *
 * Computed from the *book's* premium and contracted rate, not the statement's.
 * The statement is the thing under audit; using its own numbers to derive what it
 * should have said would make every line agree with itself.
 */
function expectedCommission(policy: BookPolicy): Cents | null {
  if (policy.premiumCents === null || policy.commissionRate === null) return null;
  return Math.round(policy.premiumCents * policy.commissionRate);
}

function formatRate(rate: number): string {
  return `${(rate * 100).toFixed(2).replace(/\.?0+$/, "")}%`;
}

function dollars(cents: Cents): string {
  const negative = cents < 0;
  const abs = Math.abs(cents);
  const s = `$${Math.floor(abs / 100).toLocaleString("en-US")}.${String(abs % 100).padStart(2, "0")}`;
  return negative ? `-${s}` : s;
}

/**
 * Audit one matched pair.
 *
 * Chargebacks and cancellations are skipped: a negative commission on a cancelled
 * policy is correct behaviour, and running it through the underpayment comparison
 * would report every cancellation as a shortfall.
 */
function auditPair(pair: MatchedPair): Finding[] {
  const { line, policy } = pair;
  const findings: Finding[] = [];

  if (line.transactionType === "chargeback" || line.transactionType === "cancellation") {
    return findings;
  }

  // A premium disagreement is reported in its own right: it changes what the
  // agency should expect, and it is frequently the underlying cause of a variance.
  if (
    policy.premiumCents !== null &&
    line.premiumCents !== null &&
    policy.premiumCents !== line.premiumCents
  ) {
    const delta = line.premiumCents - policy.premiumCents;
    findings.push({
      code: "PREMIUM_MISMATCH",
      line,
      policy,
      expectedCents: policy.premiumCents,
      paidCents: line.premiumCents,
      varianceCents: delta,
      material: Math.abs(delta) > materialityFloor(policy.premiumCents),
      message: `Premium on the statement (${dollars(line.premiumCents)}) differs from the book (${dollars(policy.premiumCents)}).`,
    });
  }

  // A rate disagreement is the single most common cause of silent underpayment,
  // and worth naming even when the resulting dollar variance is small.
  if (
    policy.commissionRate !== null &&
    line.commissionRate !== null &&
    Math.abs(policy.commissionRate - line.commissionRate) > 0.0005
  ) {
    findings.push({
      code: "RATE_MISMATCH",
      line,
      policy,
      expectedCents: null,
      paidCents: null,
      varianceCents: null,
      material: true,
      message: `Paid at ${formatRate(line.commissionRate)} against a contracted ${formatRate(policy.commissionRate)}.`,
    });
  }

  const expected = expectedCommission(policy);

  if (expected === null) {
    findings.push({
      code: "NO_EXPECTATION",
      line,
      policy,
      expectedCents: null,
      paidCents: line.commissionCents,
      varianceCents: null,
      material: false,
      message:
        "Cannot be checked: the book row is missing a premium or a contracted commission rate.",
    });
    return findings;
  }

  const paid = line.commissionCents ?? 0;
  const variance = paid - expected;
  const material = Math.abs(variance) > materialityFloor(expected);

  if (variance < 0) {
    findings.push({
      code: "UNDERPAID",
      line,
      policy,
      expectedCents: expected,
      paidCents: paid,
      varianceCents: variance,
      material,
      message: `Paid ${dollars(paid)} against an expected ${dollars(expected)} — short by ${dollars(Math.abs(variance))}.`,
    });
  } else if (variance > 0) {
    findings.push({
      code: "OVERPAID",
      line,
      policy,
      expectedCents: expected,
      paidCents: paid,
      varianceCents: variance,
      material,
      message: `Paid ${dollars(paid)} against an expected ${dollars(expected)} — over by ${dollars(variance)}.`,
    });
  }

  return findings;
}

/**
 * Turn a match report into the findings an agency acts on.
 *
 * Ambiguous and unmatched statement lines are deliberately not audited. A variance
 * computed against a policy we are not certain is the right one is exactly the
 * confident wrong number this product exists to avoid.
 */
export function auditMatches(report: MatchReport): AuditReport {
  const findings: Finding[] = [];

  for (const pair of report.matched) {
    findings.push(...auditPair(pair));
  }

  // Book policies no statement line touched. This is the headline finding: not a
  // rate error but a policy the carrier appears not to have paid on at all.
  for (const policy of report.unmatchedPolicies) {
    const expected = expectedCommission(policy);
    findings.push({
      code: "NOT_PAID",
      line: null,
      policy,
      expectedCents: expected,
      paidCents: null,
      varianceCents: expected === null ? null : -expected,
      material: expected !== null && Math.abs(expected) > materialityFloor(expected),
      message:
        expected === null
          ? `No commission line for ${policy.insuredNameRaw} (${policy.policyNumberRaw}) on this statement, and the book has no premium or rate to value it.`
          : `No commission line for ${policy.insuredNameRaw} (${policy.policyNumberRaw}) on this statement. Expected ${dollars(expected)}.`,
    });
  }

  let netVarianceCents = 0;
  let totalUnderpaidCents = 0;
  let totalNotPaidCents = 0;
  let uncheckedCount = 0;

  for (const f of findings) {
    if (f.code === "NO_EXPECTATION") {
      uncheckedCount += 1;
      continue;
    }
    // Premium and rate mismatches are causes, not amounts. Counting them into the
    // money totals would double-count the variance they already explain.
    if (f.code === "PREMIUM_MISMATCH" || f.code === "RATE_MISMATCH") continue;
    if (!f.material || f.varianceCents === null) continue;

    netVarianceCents += f.varianceCents;
    if (f.code === "UNDERPAID") totalUnderpaidCents += Math.abs(f.varianceCents);
    if (f.code === "NOT_PAID") totalNotPaidCents += Math.abs(f.varianceCents);
  }

  return {
    findings,
    netVarianceCents,
    totalUnderpaidCents,
    totalNotPaidCents,
    uncheckedCount,
  };
}
