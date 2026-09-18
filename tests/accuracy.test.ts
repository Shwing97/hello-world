/**
 * Kill criterion K4: field-level extraction accuracy on labelled statements.
 *
 * The plan commits to not charging anyone until this clears 95%. This harness is
 * what makes that claim checkable rather than rhetorical. Every real statement we
 * are ever given should be labelled and added here.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { convertStatement } from "@/lib/convert";
import { MemoryProfileStore } from "@/lib/profiles";
import type { CanonicalLine } from "@/lib/schema";

const SCORED_FIELDS = [
  "policyNumber",
  "insuredName",
  "commissionCents",
  "premiumCents",
  "commissionRate",
  "effectiveDate",
  "transactionType",
] as const;

type ScoredField = (typeof SCORED_FIELDS)[number];
type Expected = Partial<Record<ScoredField, unknown>>;

interface LabelledFixture {
  file: string;
  lines: Expected[];
}

/** Ground truth, hand-labelled from the fixture contents. */
const LABELLED: LabelledFixture[] = [
  {
    file: "travelers-simple.csv",
    lines: [
      { policyNumber: "POL0001234", insuredName: "SMITH SONS", commissionCents: 18000, premiumCents: 120000, commissionRate: 0.15, effectiveDate: "2026-03-15", transactionType: "new" },
      { policyNumber: "POL0001235", insuredName: "ACME", commissionCents: 30000, premiumCents: 240000, commissionRate: 0.125, effectiveDate: "2026-04-01", transactionType: "renewal" },
      { policyNumber: "POL0001236", insuredName: "RIVERBEND DENTAL", commissionCents: 13500, premiumCents: 90000, commissionRate: 0.15, effectiveDate: "2026-04-18", transactionType: "new" },
    ],
  },
  {
    file: "grange-preamble-total.csv",
    lines: [
      { policyNumber: "GR88120", insuredName: "RIVERBEND DENTAL", commissionCents: 11900, premiumCents: 85000, commissionRate: 0.14, effectiveDate: "2026-04-05" },
      { policyNumber: "GR88121", insuredName: "TOBIAS HART", commissionCents: 21000, premiumCents: 150000, commissionRate: 0.14, effectiveDate: "2026-04-12" },
      { policyNumber: "GR88122", insuredName: "NGUYEN LINH", commissionCents: 28000, premiumCents: 200000, commissionRate: 0.14, effectiveDate: "2026-04-22" },
    ],
  },
  {
    file: "abbrev-chargeback.csv",
    lines: [
      { policyNumber: "4521", insuredName: "HART TOBIAS", commissionCents: 15000, premiumCents: 125000, commissionRate: 0.12, effectiveDate: "2026-03-04", transactionType: "new" },
      { policyNumber: "4521", insuredName: "HART TOBIAS", commissionCents: -15000, premiumCents: -125000, commissionRate: 0.12, effectiveDate: "2026-03-04", transactionType: "cancellation" },
      { policyNumber: "4522", insuredName: "WESTSIDE AUTO BODY", commissionCents: 30000, premiumCents: 300000, commissionRate: 0.1, effectiveDate: "2026-03-12", transactionType: "renewal" },
    ],
  },
  {
    file: "intl-dates.csv",
    lines: [
      { policyNumber: "X1001", insuredName: "ALPHA HOLDINGS", commissionCents: 10000, effectiveDate: "2026-06-25" },
      { policyNumber: "X1002", insuredName: "BETA TRADING", commissionCents: 20000, effectiveDate: "2026-06-03" },
      { policyNumber: "X1003", insuredName: "GAMMA SERVICES", commissionCents: 15000, effectiveDate: "2026-07-14" },
    ],
  },
];

function matches(actual: unknown, expected: unknown): boolean {
  if (typeof expected === "number" && typeof actual === "number") {
    return Math.abs(actual - expected) < 1e-6;
  }
  return actual === expected;
}

describe("extraction accuracy (K4)", () => {
  it("meets the 95% field-level accuracy floor across all labelled statements", async () => {
    const store = new MemoryProfileStore();

    let compared = 0;
    let correct = 0;
    const failures: string[] = [];
    const perField = new Map<ScoredField, { n: number; ok: number }>();

    for (const fixture of LABELLED) {
      const text = readFileSync(new URL(`../fixtures/${fixture.file}`, import.meta.url), "utf8");
      const result = await convertStatement({
        filename: fixture.file, format: "csv", text, store,
      });

      expect(result.lines, `${fixture.file} produced no lines`).toHaveLength(fixture.lines.length);

      fixture.lines.forEach((expectedLine, i) => {
        const actualLine = result.lines[i] as CanonicalLine;

        for (const field of SCORED_FIELDS) {
          if (!(field in expectedLine)) continue;

          const stat = perField.get(field) ?? { n: 0, ok: 0 };
          const hit = matches(actualLine[field], expectedLine[field]);

          compared += 1;
          stat.n += 1;
          if (hit) {
            correct += 1;
            stat.ok += 1;
          } else {
            failures.push(
              `${fixture.file} line ${i + 1} ${field}: expected ${JSON.stringify(expectedLine[field])}, got ${JSON.stringify(actualLine[field])}`,
            );
          }
          perField.set(field, stat);
        }
      });
    }

    const accuracy = correct / compared;

    // Printed on every run so a regression is visible, not just a red test.
    const breakdown = [...perField.entries()]
      .map(([f, s]) => `${f} ${((s.ok / s.n) * 100).toFixed(1)}%`)
      .join("  ");
    console.log(
      `\nK4 accuracy: ${(accuracy * 100).toFixed(2)}% (${correct}/${compared} fields)\n  ${breakdown}\n`,
    );
    if (failures.length > 0) console.log(`  failures:\n    ${failures.join("\n    ")}\n`);

    expect(failures).toEqual([]);
    expect(accuracy).toBeGreaterThanOrEqual(0.95);
  });

  it("reaches the accuracy floor without a single LLM call", async () => {
    const store = new MemoryProfileStore();

    for (const fixture of LABELLED) {
      const text = readFileSync(new URL(`../fixtures/${fixture.file}`, import.meta.url), "utf8");
      const result = await convertStatement({ filename: fixture.file, format: "csv", text, store });
      // "heuristic" on first sight, "known" thereafter - never "llm".
      expect(result.telemetry.inductionMethod, fixture.file).not.toBe("llm");
    }
  });
});
