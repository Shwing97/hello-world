/**
 * Orchestration: a carrier statement in, canonical lines out.
 *
 * Also the measurement point for kill criterion K3 (the carrier format tail).
 * Every conversion emits telemetry saying whether we already knew this layout.
 * That number decides whether the business works, so it is produced here on the
 * hot path rather than bolted on later.
 */

import { detectCarrier, type CarrierMatch } from "./carriers";
import {
  CONFIDENCE_FLOOR,
  induceProfileHeuristic,
  type ColumnMap,
  type ProfileInducer,
} from "./induce";
import { parseMoney, parseRate } from "./money";
import {
  detectDateConvention,
  normalizeDate,
  normalizeInsuredName,
  normalizePolicyNumber,
} from "./normalize";
import {
  fingerprintHeaders,
  type ProfileStore,
  type StoredProfile,
} from "./profiles";
import { classifyTransaction, type CanonicalLine } from "./schema";
import { parseCsv, parseXlsx, toTabularSource, type Grid } from "./tabular";
import { findDeclaredTotal, validateLines, type Issue, type ValidationResult } from "./validate";

export type SourceFormat = "csv" | "xlsx" | "pdf";

export interface ConversionTelemetry {
  fingerprint: string;
  carrierId: string | null;
  format: SourceFormat;
  /** K3: was this layout already in the profile library? */
  profileExisted: boolean;
  inductionMethod: "known" | "heuristic" | "llm" | "failed";
  profileConfidence: number;
  lineCount: number;
  headerRowIndex: number;
  occurredAt: string;
}

export interface ConversionResult {
  ok: boolean;
  lines: CanonicalLine[];
  headers: string[];
  carrier: CarrierMatch | null;
  columnMap: ColumnMap;
  issues: Issue[];
  validation: ValidationResult | null;
  telemetry: ConversionTelemetry;
}

export interface ConvertInput {
  filename: string;
  format: SourceFormat;
  /** Provide exactly one, matching `format`. */
  text?: string;
  buffer?: ArrayBuffer;
  store: ProfileStore;
  inducer?: ProfileInducer;
}

function cell(row: readonly string[], index: number | undefined): string {
  if (index === undefined) return "";
  return (row[index] ?? "").trim();
}

export async function convertStatement(input: ConvertInput): Promise<ConversionResult> {
  const { filename, format, store, inducer } = input;
  const occurredAt = new Date().toISOString();

  if (format === "pdf") {
    // Deliberately unimplemented in Stage 0. PDF layouts cannot be validated
    // without real samples, and a plausible-looking wrong number is worse than an
    // honest refusal. These uploads are still counted for K3.
    return {
      ok: false,
      lines: [],
      headers: [],
      carrier: null,
      columnMap: {},
      issues: [{
        severity: "error",
        code: "PDF_NOT_SUPPORTED",
        message: "PDF statements are not converted automatically yet. Upload a CSV or Excel export if your carrier offers one.",
      }],
      validation: null,
      telemetry: {
        fingerprint: "", carrierId: null, format, profileExisted: false,
        inductionMethod: "failed", profileConfidence: 0, lineCount: 0,
        headerRowIndex: -1, occurredAt,
      },
    };
  }

  let grid: Grid;
  if (format === "csv") {
    grid = parseCsv(input.text ?? "");
  } else {
    if (!input.buffer) throw new Error("xlsx conversion requires a buffer");
    grid = await parseXlsx(input.buffer);
  }

  const source = toTabularSource(grid);
  const preambleText = source.preamble.flat().join(" ");
  const carrier = detectCarrier(filename, preambleText);

  if (source.headerRowIndex < 0) {
    return {
      ok: false,
      lines: [],
      headers: [],
      carrier,
      columnMap: {},
      issues: [{
        severity: "error",
        code: "NO_HEADER_ROW",
        message: "No header row could be identified. The file may not be a commission statement.",
      }],
      validation: null,
      telemetry: {
        fingerprint: "", carrierId: carrier?.carrier.id ?? null, format,
        profileExisted: false, inductionMethod: "failed", profileConfidence: 0,
        lineCount: 0, headerRowIndex: -1, occurredAt,
      },
    };
  }

  const fingerprint = fingerprintHeaders(source.headers);
  const stored = await store.get(fingerprint);

  const issues: Issue[] = [];
  let columnMap: ColumnMap;
  let profileConfidence: number;
  let inductionMethod: ConversionTelemetry["inductionMethod"];

  if (stored) {
    columnMap = stored.columnMap;
    profileConfidence = stored.confidence;
    inductionMethod = "known";
  } else {
    const induced = induceProfileHeuristic(source.headers);

    if (induced.confidence >= CONFIDENCE_FLOOR) {
      columnMap = induced.columnMap;
      profileConfidence = induced.confidence;
      inductionMethod = "heuristic";
    } else if (inducer) {
      try {
        const viaLlm = await inducer.induce(source.headers, source.dataRows.slice(0, 20));
        columnMap = viaLlm.columnMap;
        profileConfidence = viaLlm.confidence;
        inductionMethod = "llm";
      } catch {
        columnMap = induced.columnMap;
        profileConfidence = induced.confidence;
        inductionMethod = "failed";
        issues.push({
          severity: "error",
          code: "PROFILE_UNRESOLVED",
          message: `This layout could not be read confidently. Missing: ${induced.missingRequired.join(", ") || "none"}.`,
        });
      }
    } else {
      columnMap = induced.columnMap;
      profileConfidence = induced.confidence;
      inductionMethod = "failed";
      issues.push({
        severity: "error",
        code: "PROFILE_UNRESOLVED",
        message: `This layout could not be read confidently. Missing: ${induced.missingRequired.join(", ") || "none"}.`,
      });
    }

    if (inductionMethod === "heuristic" || inductionMethod === "llm") {
      const profile: StoredProfile = {
        fingerprint,
        carrierId: carrier?.carrier.id ?? null,
        format,
        columnMap,
        headers: source.headers,
        confidence: profileConfidence,
        method: inductionMethod === "llm" ? "llm" : "heuristic",
        sampleCount: 0,
        createdAt: occurredAt,
        updatedAt: occurredAt,
      };
      try {
        await store.put(profile);
      } catch (err) {
        issues.push({
          severity: "warning",
          code: "PROFILE_NOT_STORED",
          message: err instanceof Error ? err.message : "Profile could not be stored.",
        });
      }
    }
  }

  // Trailer rows (subtotals, "Total", carrier footers) are where declared totals
  // live. They are excluded from the line items but still fed to the totals
  // cross-check. Two shapes occur in practice: a row with no policy and no
  // insured, and a row where the word "Total" lands in the first column.
  const dataRows = source.dataRows.filter((row) => {
    const policy = cell(row, columnMap.policyNumber);
    const insured = cell(row, columnMap.insuredName);
    if (policy === "" && insured === "") return false;
    if (/^(sub)?totals?\b/i.test(policy)) return false;
    return true;
  });

  // Date conventions are a property of the column, not the cell.
  const effectiveConvention = detectDateConvention(
    dataRows.map((row) => cell(row, columnMap.effectiveDate)),
  );
  const statementConvention = detectDateConvention(
    dataRows.map((row) => cell(row, columnMap.statementDate)),
  );

  const lines: CanonicalLine[] = dataRows.map((row, i) => {
    const policy = normalizePolicyNumber(cell(row, columnMap.policyNumber));
    const insured = normalizeInsuredName(cell(row, columnMap.insuredName));
    const commissionCents = parseMoney(cell(row, columnMap.commissionAmount));
    const effective = normalizeDate(cell(row, columnMap.effectiveDate), effectiveConvention);

    return {
      sourceRow: source.headerRowIndex + 2 + i,
      policyNumberRaw: policy.raw,
      policyNumber: policy.norm,
      insuredNameRaw: insured.raw,
      insuredName: insured.norm,
      insuredNameSorted: insured.sorted,
      commissionCents,
      premiumCents: parseMoney(cell(row, columnMap.premium)),
      commissionRate: parseRate(cell(row, columnMap.commissionRate)),
      effectiveDate: effective.iso,
      effectiveDateAmbiguous: effective.ambiguous,
      transactionType: classifyTransaction(cell(row, columnMap.transactionType), commissionCents),
      producerCode: cell(row, columnMap.producerCode) || null,
      lineOfBusiness: cell(row, columnMap.lineOfBusiness) || null,
      statementDate: normalizeDate(cell(row, columnMap.statementDate), statementConvention).iso,
    };
  });

  const declaredTotal = findDeclaredTotal([...source.preamble, ...source.dataRows]);
  const validation = validateLines(lines, declaredTotal);
  issues.push(...validation.issues);

  const hasBlockingError = issues.some(
    (i) => i.severity === "error" && (i.code === "PROFILE_UNRESOLVED" || i.code === "TOTAL_MISMATCH"),
  );

  return {
    ok: !hasBlockingError && lines.length > 0,
    lines,
    headers: source.headers,
    carrier,
    columnMap,
    issues,
    validation,
    telemetry: {
      fingerprint,
      carrierId: carrier?.carrier.id ?? null,
      format,
      profileExisted: stored !== null,
      inductionMethod,
      profileConfidence: Number(profileConfidence.toFixed(3)),
      lineCount: lines.length,
      headerRowIndex: source.headerRowIndex,
      occurredAt,
    },
  };
}
