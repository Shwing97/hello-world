import { describe, expect, it } from "vitest";
import { CONFIDENCE_FLOOR, induceProfileHeuristic } from "@/lib/induce";

describe("induceProfileHeuristic", () => {
  it("maps a conventional header row without needing an LLM", () => {
    const p = induceProfileHeuristic([
      "Policy Number", "Insured Name", "Effective Date",
      "Written Premium", "Commission Rate", "Commission Amount", "Transaction Type",
    ]);

    expect(p.missingRequired).toEqual([]);
    expect(p.confidence).toBeGreaterThanOrEqual(CONFIDENCE_FLOOR);
    expect(p.columnMap.policyNumber).toBe(0);
    expect(p.columnMap.insuredName).toBe(1);
    expect(p.columnMap.commissionAmount).toBe(5);
  });

  it("does not let the commission amount steal the rate column", () => {
    // "Commission Rate" and "Commission Amount" both contain "commission"; the
    // specific phrase must win over the substring.
    const p = induceProfileHeuristic(["Policy #", "Insured", "Commission Rate", "Commission Amount"]);
    expect(p.columnMap.commissionRate).toBe(2);
    expect(p.columnMap.commissionAmount).toBe(3);
  });

  it("handles the abbreviations carriers actually print", () => {
    const p = induceProfileHeuristic(["Pol No", "Insured", "Eff Dt", "Prem", "Rate", "Comm Amt"]);
    expect(p.missingRequired).toEqual([]);
    expect(p.columnMap.policyNumber).toBe(0);
    expect(p.columnMap.commissionAmount).toBe(5);
    expect(p.columnMap.commissionRate).toBe(4);
    expect(p.columnMap.premium).toBe(3);
  });

  it("assigns each column to at most one field", () => {
    const p = induceProfileHeuristic(["Policy Number", "Insured", "Commission"]);
    const used = Object.values(p.columnMap);
    expect(new Set(used).size).toBe(used.length);
  });

  it("reports zero confidence on an unrecognisable layout rather than guessing", () => {
    const p = induceProfileHeuristic(["Field1", "Field2", "Field3"]);
    expect(p.confidence).toBe(0);
    expect(p.missingRequired.length).toBeGreaterThan(0);
  });
});
