import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { detectHeaderRow, parseCsv, toTabularSource } from "@/lib/tabular";

function fixture(name: string): string {
  return readFileSync(new URL(`../fixtures/${name}`, import.meta.url), "utf8");
}

describe("detectHeaderRow", () => {
  it("finds the header beneath a carrier preamble", () => {
    const grid = parseCsv(fixture("grange-preamble-total.csv"));
    // Four preamble lines plus a blank one - the header is row index 5.
    expect(detectHeaderRow(grid)).toBe(5);
  });

  it("uses row 0 when the file starts with its header", () => {
    const grid = parseCsv(fixture("travelers-simple.csv"));
    expect(detectHeaderRow(grid)).toBe(0);
  });
});

describe("toTabularSource", () => {
  it("separates preamble, header and data", () => {
    const source = toTabularSource(parseCsv(fixture("grange-preamble-total.csv")));

    expect(source.preamble.length).toBe(5);
    expect(source.headers[0]).toBe("Policy #");
    // Three policy rows plus the trailing Total row; the Total row is dropped
    // later, by convertStatement, once the column map is known.
    expect(source.dataRows.length).toBe(4);
  });

  it("reports no header rather than promoting a data row", () => {
    const grid = parseCsv("alpha,beta\n1,2\n3,4\n");
    expect(toTabularSource(grid).headerRowIndex).toBe(-1);
  });
});
