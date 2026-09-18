import { describe, expect, it } from "vitest";
import { formatCents, parseMoney, parseRate, sumCents } from "@/lib/money";

describe("parseMoney", () => {
  it("parses plain and formatted amounts into integer cents", () => {
    expect(parseMoney("180.00")).toBe(18000);
    expect(parseMoney("$1,234.56")).toBe(123456);
    expect(parseMoney("1234")).toBe(123400);
    expect(parseMoney(180.5)).toBe(18050);
  });

  it("treats both chargeback conventions as negative", () => {
    expect(parseMoney("(150.00)")).toBe(-15000);
    expect(parseMoney("150.00-")).toBe(-15000);
    expect(parseMoney("-150.00")).toBe(-15000);
    expect(parseMoney("($1,250.00)")).toBe(-125000);
  });

  it("distinguishes absent from zero", () => {
    expect(parseMoney("")).toBeNull();
    expect(parseMoney("--")).toBeNull();
    expect(parseMoney("N/A")).toBeNull();
    expect(parseMoney("0.00")).toBe(0);
  });

  it("refuses to guess at malformed input", () => {
    expect(parseMoney("1.2.3")).toBeNull();
    expect(parseMoney("abc")).toBeNull();
  });

  it("avoids floating-point drift when summing", () => {
    const values = Array.from({ length: 100 }, () => parseMoney("0.07"));
    expect(sumCents(values)).toBe(700);
    expect(formatCents(sumCents(values))).toBe("7.00");
  });
});

describe("parseRate", () => {
  it("normalises both percentage conventions to a decimal fraction", () => {
    expect(parseRate("15%")).toBeCloseTo(0.15);
    expect(parseRate("15")).toBeCloseTo(0.15);
    expect(parseRate("0.15")).toBeCloseTo(0.15);
    expect(parseRate("12.5%")).toBeCloseTo(0.125);
  });

  it("returns null for blanks", () => {
    expect(parseRate("")).toBeNull();
    expect(parseRate("n/a")).toBeNull();
  });
});
