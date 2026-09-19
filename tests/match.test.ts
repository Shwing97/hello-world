import { describe, expect, it } from "vitest";
import { matchStatementToBook, toBookPolicy, type BookPolicy } from "@/lib/match";
import { normalizeInsuredName, normalizePolicyNumber } from "@/lib/normalize";
import type { CanonicalLine, TransactionType } from "@/lib/schema";

/** A statement line with the fields a test cares about and sane defaults elsewhere. */
function line(
  sourceRow: number,
  fields: {
    policyNumber?: string;
    insuredName?: string;
    commissionCents?: number | null;
    premiumCents?: number | null;
    commissionRate?: number | null;
    effectiveDate?: string | null;
    effectiveDateAmbiguous?: boolean;
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
    effectiveDate: fields.effectiveDate ?? null,
    effectiveDateAmbiguous: fields.effectiveDateAmbiguous ?? false,
    transactionType: fields.transactionType ?? "renewal",
    producerCode: null,
    lineOfBusiness: null,
    statementDate: null,
  };
}

function book(
  rows: readonly {
    policyNumber?: string;
    insuredName?: string;
    premiumCents?: number | null;
    commissionRate?: number | null;
    effectiveDate?: string | null;
  }[],
): BookPolicy[] {
  return rows.map((r, i) => toBookPolicy(r, i + 1));
}

describe("matchStatementToBook", () => {
  it("matches on policy number across formatting differences", () => {
    const report = matchStatementToBook(
      [line(1, { policyNumber: "POL-0001234-00", insuredName: "Acme Co" })],
      book([{ policyNumber: "pol000123400", insuredName: "ACME COMPANY" }]),
    );

    expect(report.matched).toHaveLength(1);
    expect(report.matched[0]?.tier).toBe("policy-exact");
    expect(report.matched[0]?.confidence).toBe("high");
    expect(report.unmatchedLines).toHaveLength(0);
    expect(report.unmatchedPolicies).toHaveLength(0);
  });

  it("uses the insured name to separate a repeated policy number", () => {
    const report = matchStatementToBook(
      [line(1, { policyNumber: "A100", insuredName: "Smith & Sons, LLC" })],
      book([
        { policyNumber: "A100", insuredName: "Jones Bakery" },
        { policyNumber: "A100", insuredName: "SONS AND SMITH INC" },
      ]),
    );

    expect(report.matched).toHaveLength(1);
    expect(report.matched[0]?.tier).toBe("policy-plus-name");
    expect(report.matched[0]?.policy.rowId).toBe(2);
  });

  it("refuses rather than picking one when nothing separates the candidates", () => {
    const report = matchStatementToBook(
      [line(1, { policyNumber: "A100", insuredName: "Unknown Party" })],
      book([
        { policyNumber: "A100", insuredName: "Jones Bakery" },
        { policyNumber: "A100", insuredName: "Acme Co" },
      ]),
    );

    expect(report.matched).toHaveLength(0);
    expect(report.ambiguous).toHaveLength(1);
    expect(report.ambiguous[0]?.candidates).toHaveLength(2);
    expect(report.issues.some((i) => i.code === "AMBIGUOUS_MATCH")).toBe(true);
  });

  it("falls back to name plus premium when the statement has no policy number", () => {
    const report = matchStatementToBook(
      [line(1, { insuredName: "Acme Co", premiumCents: 250000 })],
      book([
        { policyNumber: "B200", insuredName: "Acme Co", premiumCents: 250000 },
        { policyNumber: "B201", insuredName: "Other Co", premiumCents: 250000 },
      ]),
    );

    expect(report.matched).toHaveLength(1);
    expect(report.matched[0]?.tier).toBe("name-plus-premium");
    expect(report.matched[0]?.confidence).toBe("medium");
  });

  it("does not treat a guessed effective date as evidence of identity", () => {
    const report = matchStatementToBook(
      [
        line(1, {
          insuredName: "Acme Co",
          effectiveDate: "2026-03-04",
          effectiveDateAmbiguous: true,
        }),
      ],
      book([{ policyNumber: "C300", insuredName: "Acme Co", effectiveDate: "2026-03-04" }]),
    );

    expect(report.matched).toHaveLength(0);
    expect(report.unmatchedLines).toHaveLength(1);
  });

  it("lets a confident tier claim a policy before a weaker tier can take it", () => {
    // Line 2 names the policy outright; line 1 would otherwise grab it on name.
    const report = matchStatementToBook(
      [
        line(1, { insuredName: "Acme Co", premiumCents: 250000 }),
        line(2, { policyNumber: "B200", insuredName: "Acme Co", premiumCents: 250000 }),
      ],
      book([{ policyNumber: "B200", insuredName: "Acme Co", premiumCents: 250000 }]),
    );

    expect(report.matched).toHaveLength(1);
    expect(report.matched[0]?.line.sourceRow).toBe(2);
    expect(report.matched[0]?.tier).toBe("policy-exact");
    expect(report.unmatchedLines.map((l) => l.sourceRow)).toEqual([1]);
  });

  it("never matches two lines to the same book policy", () => {
    const report = matchStatementToBook(
      [
        line(1, { policyNumber: "D400", insuredName: "Acme Co" }),
        line(2, { policyNumber: "D400", insuredName: "Acme Co" }),
      ],
      book([{ policyNumber: "D400", insuredName: "Acme Co" }]),
    );

    expect(report.matched).toHaveLength(1);
    expect(report.unmatchedLines).toHaveLength(1);
  });

  it("does not collide blank policy numbers or blank names", () => {
    const report = matchStatementToBook(
      [line(1, { policyNumber: "", insuredName: "" })],
      book([{ policyNumber: "", insuredName: "" }]),
    );

    expect(report.matched).toHaveLength(0);
    expect(report.unmatchedLines).toHaveLength(1);
    expect(report.unmatchedPolicies).toHaveLength(1);
  });

  it("reports book policies the statement never touched", () => {
    const report = matchStatementToBook(
      [line(1, { policyNumber: "E500", insuredName: "Acme Co" })],
      book([
        { policyNumber: "E500", insuredName: "Acme Co" },
        { policyNumber: "E501", insuredName: "Missing Co" },
      ]),
    );

    expect(report.unmatchedPolicies).toHaveLength(1);
    expect(report.unmatchedPolicies[0]?.policyNumberRaw).toBe("E501");
  });
});
