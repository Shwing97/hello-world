import { beforeEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { convertStatement } from "@/lib/convert";
import { MemoryProfileStore } from "@/lib/profiles";

function fixture(name: string): string {
  return readFileSync(new URL(`../fixtures/${name}`, import.meta.url), "utf8");
}

function convert(name: string, store = new MemoryProfileStore()) {
  return convertStatement({ filename: name, format: "csv", text: fixture(name), store });
}

describe("convertStatement", () => {
  let store: MemoryProfileStore;
  beforeEach(() => {
    store = new MemoryProfileStore();
  });

  it("converts a conventional statement exactly", async () => {
    const r = await convert("travelers-simple.csv", store);

    expect(r.ok).toBe(true);
    expect(r.lines).toHaveLength(3);
    expect(r.carrier?.carrier.id).toBe("travelers");

    const first = r.lines[0]!;
    expect(first.policyNumber).toBe("POL0001234");
    expect(first.insuredName).toBe("SMITH SONS");
    expect(first.commissionCents).toBe(18000);
    expect(first.premiumCents).toBe(120000);
    expect(first.commissionRate).toBeCloseTo(0.15);
    expect(first.effectiveDate).toBe("2026-03-15");
    expect(first.transactionType).toBe("new");
    // Row 1 is the header, so the first data row is source row 2.
    expect(first.sourceRow).toBe(2);
  });

  it("reads past a preamble and reconciles against the printed total", async () => {
    const r = await convert("grange-preamble-total.csv", store);

    expect(r.ok).toBe(true);
    expect(r.carrier?.carrier.id).toBe("grange");
    expect(r.lines).toHaveLength(3);
    expect(r.validation?.declaredTotal).toBe(60900);
    expect(r.validation?.lineTotal).toBe(60900);
    expect(r.validation?.totalsAgree).toBe(true);
    expect(r.issues.filter((i) => i.severity === "error")).toHaveLength(0);
  });

  it("handles abbreviations, chargebacks and named-month dates", async () => {
    const r = await convert("abbrev-chargeback.csv", store);

    expect(r.ok).toBe(true);
    expect(r.lines).toHaveLength(3);

    const [charge, reversal] = [r.lines[0]!, r.lines[1]!];
    expect(charge.policyNumber).toBe("4521");
    expect(charge.commissionCents).toBe(15000);
    expect(charge.effectiveDate).toBe("2026-03-04");

    expect(reversal.policyNumber).toBe("4521");
    expect(reversal.commissionCents).toBe(-15000);
    expect(reversal.premiumCents).toBe(-125000);
    expect(reversal.transactionType).toBe("cancellation");

    // A chargeback nets against its original rather than inflating the total.
    expect(r.validation?.lineTotal).toBe(30000);
  });

  it("applies a column-wide date convention to ambiguous values", async () => {
    const r = await convert("intl-dates.csv", store);

    expect(r.lines[0]!.effectiveDate).toBe("2026-06-25");
    // 03/06 is only resolvable because 25/06 elsewhere in the column proves DD/MM.
    expect(r.lines[1]!.effectiveDate).toBe("2026-06-03");
    expect(r.lines[1]!.effectiveDateAmbiguous).toBe(false);
  });

  it("refuses an unrecognisable layout instead of inventing a mapping", async () => {
    const r = await convert("unreadable.csv", store);

    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.code === "PROFILE_UNRESOLVED")).toBe(true);
    expect(r.telemetry.inductionMethod).toBe("failed");
  });

  it("refuses when line items do not sum to the printed total", async () => {
    const r = await convert("broken-total.csv", store);

    expect(r.lines).toHaveLength(2);
    expect(r.validation?.lineTotal).toBe(30000);
    expect(r.validation?.declaredTotal).toBe(99900);
    expect(r.validation?.totalsAgree).toBe(false);
    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.code === "TOTAL_MISMATCH")).toBe(true);
  });
});

describe("profile library (K3 instrumentation)", () => {
  it("learns a layout once and recognises it for free thereafter", async () => {
    const store = new MemoryProfileStore();

    const first = await convert("travelers-simple.csv", store);
    expect(first.telemetry.profileExisted).toBe(false);
    expect(first.telemetry.inductionMethod).toBe("heuristic");

    const second = await convert("travelers-simple.csv", store);
    expect(second.telemetry.profileExisted).toBe(true);
    expect(second.telemetry.inductionMethod).toBe("known");

    expect(await store.count()).toBe(1);
  });

  it("keeps distinct layouts apart", async () => {
    const store = new MemoryProfileStore();
    await convert("travelers-simple.csv", store);
    await convert("grange-preamble-total.csv", store);
    expect(await store.count()).toBe(2);
  });

  it("does not store customer values in the shared library", async () => {
    const store = new MemoryProfileStore();
    await convert("travelers-simple.csv", store);

    const stored = await store.get((await convert("travelers-simple.csv", store)).telemetry.fingerprint);
    expect(stored).not.toBeNull();
    for (const header of stored!.headers) {
      expect(header).not.toMatch(/\d{4,}/);
    }
    expect(JSON.stringify(stored)).not.toContain("Smith");
  });
});
