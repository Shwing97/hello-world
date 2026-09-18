import { describe, expect, it } from "vitest";
import ExcelJS from "exceljs";
import { convertStatement } from "@/lib/convert";
import { MemoryProfileStore } from "@/lib/profiles";

/**
 * Excel is the format most carriers actually email, and it differs from CSV in
 * ways that break naive parsers: real Date cells rather than strings, numeric
 * cells rather than formatted text, and a preamble above the header.
 */
async function buildWorkbook(): Promise<ArrayBuffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Commissions");

  ws.addRow(["SAFECO INSURANCE"]);
  ws.addRow(["Statement Period: 2026-05-01 to 2026-05-31"]);
  ws.addRow([]);
  ws.addRow([
    "Policy Number", "Insured Name", "Effective Date",
    "Written Premium", "Commission Rate", "Commission Amount",
  ]);
  ws.addRow(["SF-7781", "Northgate Bakery LLC", new Date(Date.UTC(2026, 4, 3)), 1000, 0.13, 130]);
  ws.addRow(["SF-7782", "Ola Adeyemi", new Date(Date.UTC(2026, 4, 19)), 2000, 0.13, 260]);

  const buffer = await wb.xlsx.writeBuffer();
  return buffer as ArrayBuffer;
}

describe("xlsx statements", () => {
  it("reads native date and numeric cells correctly", async () => {
    const result = await convertStatement({
      filename: "safeco-may.xlsx",
      format: "xlsx",
      buffer: await buildWorkbook(),
      store: new MemoryProfileStore(),
    });

    expect(result.ok).toBe(true);
    expect(result.carrier?.carrier.id).toBe("safeco");
    expect(result.lines).toHaveLength(2);

    const first = result.lines[0]!;
    expect(first.policyNumber).toBe("SF7781");
    expect(first.insuredName).toBe("NORTHGATE BAKERY");
    // A native Date cell, not a formatted string.
    expect(first.effectiveDate).toBe("2026-05-03");
    // A native number cell: 130 means $130.00, not 130 cents.
    expect(first.commissionCents).toBe(13000);
    expect(first.premiumCents).toBe(100000);
    expect(first.commissionRate).toBeCloseTo(0.13);

    expect(result.issues.filter((i) => i.severity === "error")).toHaveLength(0);
  });

  it("skips the preamble rows above the header", async () => {
    const result = await convertStatement({
      filename: "safeco-may.xlsx",
      format: "xlsx",
      buffer: await buildWorkbook(),
      store: new MemoryProfileStore(),
    });
    expect(result.telemetry.headerRowIndex).toBe(3);
  });
});
