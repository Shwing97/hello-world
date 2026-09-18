/**
 * Reading CSV and XLSX into a raw grid, and finding the row that is actually the
 * header.
 *
 * Real commission statements rarely start with their header row. They open with a
 * carrier logo block, an agency address, a statement period, and a blank line or
 * three. Assuming row 0 is the header is the single most common way a naive parser
 * silently produces garbage.
 */

import Papa from "papaparse";
import { CANONICAL_FIELDS, FIELD_SYNONYMS } from "./schema";

export type Grid = string[][];

/**
 * Hard ceiling on rows read from any single file.
 *
 * This endpoint is public and unauthenticated, and an .xlsx is a zip archive: a
 * few megabytes can decompress into something enormous. A commission statement
 * with more than this many lines does not exist in the segment we serve, so the
 * cap costs real users nothing and bounds the damage a hostile upload can do.
 */
export const MAX_ROWS = 50_000;

export interface TabularSource {
  grid: Grid;
  headerRowIndex: number;
  headers: string[];
  dataRows: Grid;
  /** Rows above the header, kept because they carry the statement period and totals. */
  preamble: Grid;
}

const SYNONYM_LOOKUP: Set<string> = (() => {
  const set = new Set<string>();
  for (const field of CANONICAL_FIELDS) {
    for (const s of FIELD_SYNONYMS[field]) {
      set.add(s.toLowerCase().replace(/[^a-z0-9%#]+/g, " ").trim());
    }
  }
  return set;
})();

function looksNumeric(cell: string): boolean {
  const s = cell.trim();
  if (s === "") return false;
  return /^[($]?-?[\d,]+(\.\d+)?%?\)?$/.test(s);
}

function headerScore(row: readonly string[]): number {
  const cells = row.map((c) => (c ?? "").trim()).filter((c) => c !== "");
  if (cells.length < 3) return 0;

  let vocabularyHits = 0;
  let numericCells = 0;

  for (const cell of cells) {
    const normalized = cell.toLowerCase().replace(/[^a-z0-9%#]+/g, " ").trim();
    if (SYNONYM_LOOKUP.has(normalized)) {
      vocabularyHits += 1;
    } else {
      for (const synonym of SYNONYM_LOOKUP) {
        if (synonym.length >= 4 && normalized.includes(synonym)) {
          vocabularyHits += 0.5;
          break;
        }
      }
    }
    if (looksNumeric(cell)) numericCells += 1;
  }

  // A header row is dense with vocabulary and nearly free of numbers.
  return vocabularyHits * 2 + cells.length * 0.1 - numericCells * 1.5;
}

/** Scan the first `limit` rows and pick the best-scoring header candidate. */
export function detectHeaderRow(grid: Grid, limit = 20): number {
  let bestIndex = 0;
  let bestScore = -Infinity;

  const end = Math.min(grid.length, limit);
  for (let i = 0; i < end; i += 1) {
    const row = grid[i];
    if (!row) continue;
    const score = headerScore(row);
    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }

  // Nothing resembled a header - treat the file as headerless rather than
  // promoting a data row and mislabelling every column.
  return bestScore <= 0 ? -1 : bestIndex;
}

export function toTabularSource(grid: Grid): TabularSource {
  const headerRowIndex = detectHeaderRow(grid);

  if (headerRowIndex < 0) {
    return { grid, headerRowIndex: -1, headers: [], dataRows: grid, preamble: [] };
  }

  const headers = (grid[headerRowIndex] ?? []).map((h) => (h ?? "").trim());
  const dataRows = grid
    .slice(headerRowIndex + 1)
    .filter((row) => row.some((cell) => (cell ?? "").trim() !== ""));

  return {
    grid,
    headerRowIndex,
    headers,
    dataRows,
    preamble: grid.slice(0, headerRowIndex),
  };
}

export function parseCsv(text: string): Grid {
  const result = Papa.parse<string[]>(text, { skipEmptyLines: false });
  return result.data
    .slice(0, MAX_ROWS)
    .map((row) => (Array.isArray(row) ? row.map((c) => String(c ?? "")) : []));
}

/** Reads the sheet with the most populated rows, not blindly the first one. */
export async function parseXlsx(buffer: ArrayBuffer): Promise<Grid> {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  let best: Grid = [];
  workbook.eachSheet((sheet) => {
    const grid: Grid = [];
    sheet.eachRow({ includeEmpty: true }, (row) => {
      if (grid.length >= MAX_ROWS) return;
      const values = Array.isArray(row.values) ? row.values.slice(1) : [];
      grid.push(values.map((v) => cellToString(v)));
    });
    if (grid.length > best.length) best = grid;
  });

  return best;
}

function cellToString(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    if (typeof o["text"] === "string") return o["text"];
    if (o["result"] !== undefined) return String(o["result"]);
    if (Array.isArray(o["richText"])) {
      return (o["richText"] as { text?: string }[]).map((r) => r.text ?? "").join("");
    }
  }
  return String(v);
}
