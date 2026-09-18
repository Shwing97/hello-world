import { describe, expect, it } from "vitest";
import {
  detectDateConvention,
  normalizeDate,
  normalizeInsuredName,
  normalizePolicyNumber,
} from "@/lib/normalize";

describe("normalizePolicyNumber", () => {
  it("collapses formatting differences between the two sides", () => {
    expect(normalizePolicyNumber("POL-0001234").norm).toBe("POL0001234");
    expect(normalizePolicyNumber("pol 000 1234").norm).toBe("POL0001234");
    expect(normalizePolicyNumber("POL0001234").norm).toBe("POL0001234");
  });

  it("strips leading zeros but preserves interior ones", () => {
    expect(normalizePolicyNumber("0004521").norm).toBe("4521");
    expect(normalizePolicyNumber("4521").norm).toBe("4521");
    expect(normalizePolicyNumber("A-000-5").norm).toBe("A0005");
  });

  it("never returns an empty string for a non-empty input", () => {
    expect(normalizePolicyNumber("000").norm).toBe("0");
  });
});

describe("normalizeInsuredName", () => {
  it("survives entity-suffix and word-order disagreement", () => {
    const a = normalizeInsuredName("Smith & Sons, LLC");
    const b = normalizeInsuredName("SONS AND SMITH INC");
    expect(a.sorted).toBe(b.sorted);
  });

  it("keeps a readable normalised form", () => {
    expect(normalizeInsuredName("HART, TOBIAS").norm).toBe("HART TOBIAS");
    expect(normalizeInsuredName("Westside Auto Body Inc").norm).toBe("WESTSIDE AUTO BODY");
  });

  it("treats dotted and undotted entity suffixes as the same name", () => {
    // This is the real cross-carrier case: one statement prints "P.C.", another
    // prints "PC", and the book of business may print neither.
    expect(normalizeInsuredName("Riverbend Dental, P.C.").sorted).toBe(
      normalizeInsuredName("Riverbend Dental PC").sorted,
    );
    expect(normalizeInsuredName("Riverbend Dental, P.C.").norm).toBe("RIVERBEND DENTAL");
  });
});

describe("detectDateConvention", () => {
  it("lets one unambiguous value settle the whole column", () => {
    expect(detectDateConvention(["25/06/2026", "03/06/2026"])).toBe("dmy");
    expect(detectDateConvention(["06/25/2026", "06/03/2026"])).toBe("mdy");
  });

  it("reports unknown rather than picking a side", () => {
    expect(detectDateConvention(["03/04/2026", "05/06/2026"])).toBe("unknown");
    expect(detectDateConvention(["25/06/2026", "06/25/2026"])).toBe("unknown");
    expect(detectDateConvention([])).toBe("unknown");
  });
});

describe("normalizeDate", () => {
  it("parses the formats carriers actually use", () => {
    expect(normalizeDate("2026-03-15").iso).toBe("2026-03-15");
    expect(normalizeDate("04-Mar-2026").iso).toBe("2026-03-04");
    expect(normalizeDate("Mar 4, 2026").iso).toBe("2026-03-04");
    expect(normalizeDate("03/15/2026").iso).toBe("2026-03-15");
    expect(normalizeDate(new Date(Date.UTC(2026, 2, 15))).iso).toBe("2026-03-15");
  });

  it("applies the column convention to ambiguous values", () => {
    expect(normalizeDate("03/06/2026", "dmy").iso).toBe("2026-06-03");
    expect(normalizeDate("03/06/2026", "mdy").iso).toBe("2026-03-06");
  });

  it("flags a guess instead of hiding it", () => {
    const guessed = normalizeDate("03/06/2026");
    expect(guessed.iso).toBe("2026-03-06");
    expect(guessed.ambiguous).toBe(true);

    const certain = normalizeDate("25/06/2026");
    expect(certain.iso).toBe("2026-06-25");
    expect(certain.ambiguous).toBe(false);
  });

  it("rejects impossible dates rather than rolling them over", () => {
    expect(normalizeDate("02/31/2026").iso).toBeNull();
    expect(normalizeDate("not a date").iso).toBeNull();
  });
});
