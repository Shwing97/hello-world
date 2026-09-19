import { describe, expect, it } from "vitest";
import { auditMatches } from "@/lib/audit";
import { matchStatementToBook, toBookPolicy } from "@/lib/match";
import { normalizeInsuredName, normalizePolicyNumber } from "@/lib/normalize";
import type { CanonicalLine, TransactionType } from "@/lib/schema";

function line(
  sourceRow: number,
  fields: {
    policyNumber?: string;
    insuredName?: string;
    commissionCents?: number | null;
    premiumCents?: number | null;
    commissionRate?: number | null;
    transactionType?: TransactionType;
  },
): CanonicalLine {
  const policy = normalizePolicyNumber(fields.policyNumber ?? "");
  const name = normalizeInsuredName(fields.insuredName ?? "");

  return {
    sourceRow,
    policyNumberRaw: policy.raw,
    policyNumber: policy.norm,
    insuredNameRaw: name.raw,
    insuredName: name.norm,
    insuredNameSorted: name.sorted,
    commissionCents: fields.commissionCents ?? null,
    premiumCents: fields.premiumCents ?? null,
    commissionRate: fields.commissionRate ?? null,
    effectiveDate: null,
    effectiveDateAmbiguous: false,
    transactionType: fields.transactionType ?? "renewal",
    producerCode: null,
    lineOfBusiness: null,
    statementDate: null,
  };
}

/** One statement line and one book policy, already matched on policy number. */
function auditOne(
  statement: Parameters<typeof line>[1],
  policy: {
    premiumCents?: number | null;
    commissionRate?: number | null;
  },
) {
  const report = matchStatementToBook(
    [line(1, { policyNumber: "P1", insuredName: "Acme Co", ...statement })],
    [toBookPolicy({ policyNumber: "P1", insuredName: "Acme Co", ...policy }, 1)],
  );
  expect(report.matched).toHaveLength(1);
  return auditMatches(report);
}

describe("auditMatches", () => {
  it("finds the silent underpayment: right premium, wrong rate", () => {
    // Contracted 15% on $10,000 is $1,500. The carrier paid 10%.
    const audit = auditOne(
      { premiumCents: 1000000, commissionCents: 100000, commissionRate: 0.1 },
      { premiumCents: 1000000, commissionRate: 0.15 },
    );

    const underpaid = audit.findings.find((f) => f.code === "UNDERPAID");
    expect(underpaid).toBeDefined();
    expect(underpaid?.expectedCents).toBe(150000);
    expect(underpaid?.paidCents).toBe(100000);
    expect(underpaid?.varianceCents).toBe(-50000);
    expect(underpaid?.material).toBe(true);

    expect(audit.totalUnderpaidCents).toBe(50000);
    expect(audit.netVarianceCents).toBe(-50000);

    // The rate disagreement is named as the cause...
    expect(audit.findings.some((f) => f.code === "RATE_MISMATCH")).toBe(true);
    // ...but is not double-counted into the money.
    expect(audit.netVarianceCents).toBe(-50000);
  });

  it("reports a book policy the carrier did not pay at all", () => {
    const report = matchStatementToBook(
      [],
      [toBookPolicy({ policyNumber: "P9", insuredName: "Missing Co", premiumCents: 500000, commissionRate: 0.12 }, 1)],
    );
    const audit = auditMatches(report);

    const notPaid = audit.findings.find((f) => f.code === "NOT_PAID");
    expect(notPaid).toBeDefined();
    expect(notPaid?.line).toBeNull();
    expect(notPaid?.expectedCents).toBe(60000);
    expect(notPaid?.varianceCents).toBe(-60000);
    expect(audit.totalNotPaidCents).toBe(60000);
  });

  it("stays in integer cents on rates that do not divide evenly", () => {
    // 12.5% of $1,234.57 is 154.32125 -> 15432 cents, never a float.
    const audit = auditOne(
      { premiumCents: 123457, commissionCents: 15432 },
      { premiumCents: 123457, commissionRate: 0.125 },
    );

    const findings = audit.findings.filter((f) => f.code === "UNDERPAID" || f.code === "OVERPAID");
    expect(findings).toHaveLength(0);
    expect(Number.isInteger(audit.netVarianceCents)).toBe(true);
    expect(audit.netVarianceCents).toBe(0);
  });

  it("does not report a cancellation's negative commission as a shortfall", () => {
    const audit = auditOne(
      { commissionCents: -45000, premiumCents: 300000, transactionType: "cancellation" },
      { premiumCents: 300000, commissionRate: 0.15 },
    );

    expect(audit.findings).toHaveLength(0);
    expect(audit.netVarianceCents).toBe(0);
  });

  it("does not report a chargeback as a shortfall", () => {
    const audit = auditOne(
      { commissionCents: -45000, premiumCents: 300000, transactionType: "chargeback" },
      { premiumCents: 300000, commissionRate: 0.15 },
    );

    expect(audit.findings).toHaveLength(0);
  });

  it("flags a premium disagreement separately from the commission variance", () => {
    const audit = auditOne(
      { premiumCents: 900000, commissionCents: 135000 },
      { premiumCents: 1000000, commissionRate: 0.15 },
    );

    const premium = audit.findings.find((f) => f.code === "PREMIUM_MISMATCH");
    expect(premium).toBeDefined();
    expect(premium?.varianceCents).toBe(-100000);

    // The commission shortfall is still reported against the book's own figures.
    const underpaid = audit.findings.find((f) => f.code === "UNDERPAID");
    expect(underpaid?.expectedCents).toBe(150000);
    expect(underpaid?.varianceCents).toBe(-15000);
  });

  it("says it cannot check a line rather than assuming a rate", () => {
    const audit = auditOne(
      { commissionCents: 100000 },
      { premiumCents: 1000000, commissionRate: null },
    );

    expect(audit.findings.some((f) => f.code === "NO_EXPECTATION")).toBe(true);
    expect(audit.uncheckedCount).toBe(1);
    expect(audit.netVarianceCents).toBe(0);
  });

  it("reports a sub-dollar variance but does not call it material", () => {
    const audit = auditOne(
      { premiumCents: 1000000, commissionCents: 149950 },
      { premiumCents: 1000000, commissionRate: 0.15 },
    );

    const underpaid = audit.findings.find((f) => f.code === "UNDERPAID");
    expect(underpaid?.varianceCents).toBe(-50);
    expect(underpaid?.material).toBe(false);
    expect(audit.totalUnderpaidCents).toBe(0);
  });

  it("never audits an ambiguous match", () => {
    const report = matchStatementToBook(
      [line(1, { policyNumber: "P5", insuredName: "Unknown Party", commissionCents: 1 })],
      [
        toBookPolicy({ policyNumber: "P5", insuredName: "A Co", premiumCents: 100000, commissionRate: 0.15 }, 1),
        toBookPolicy({ policyNumber: "P5", insuredName: "B Co", premiumCents: 100000, commissionRate: 0.15 }, 2),
      ],
    );
    const audit = auditMatches(report);

    // Both policies are unclaimed, so they surface as NOT_PAID for review — but
    // no variance is ever computed against a policy we did not confidently match.
    expect(audit.findings.every((f) => f.code === "NOT_PAID")).toBe(true);
  });
});
