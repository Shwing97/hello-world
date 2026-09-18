/**
 * Tier 2 of the parsing strategy: work out a carrier's column layout once, store
 * it, and never pay for it again.
 *
 * A deterministic header matcher runs first and resolves the large majority of
 * structured statements for free. The LLM is only consulted when the heuristic is
 * genuinely uncertain, which is what keeps inference cost off the critical path.
 */

import {
  CANONICAL_FIELDS,
  FIELD_SYNONYMS,
  REQUIRED_FIELDS,
  type CanonicalField,
} from "./schema";

export type ColumnMap = Partial<Record<CanonicalField, number>>;

export interface InducedProfile {
  columnMap: ColumnMap;
  /** 0-1. Below CONFIDENCE_FLOOR the caller should escalate to the LLM. */
  confidence: number;
  method: "heuristic" | "llm";
  missingRequired: CanonicalField[];
  /** Per-field match scores, retained so a human or agent can audit a bad profile. */
  scores: Partial<Record<CanonicalField, number>>;
}

export const CONFIDENCE_FLOOR = 0.62;

function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9%#]+/g, " ").replace(/\s+/g, " ").trim();
}

function tokens(s: string): string[] {
  return s.split(" ").filter(Boolean);
}

function jaccard(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const setA = new Set(a);
  const setB = new Set(b);
  let inter = 0;
  for (const t of setA) if (setB.has(t)) inter += 1;
  return inter / (setA.size + setB.size - inter);
}

/**
 * Score one header against one canonical field.
 *
 * Longer synonyms are more specific, so a phrase match on "commission rate" beats
 * a substring match on "commission" - which is what stops a rate column being
 * mapped to the commission amount.
 */
function scoreHeaderAgainstField(header: string, field: CanonicalField): number {
  const h = normalizeHeader(header);
  if (h === "") return 0;

  const hTokens = tokens(h);
  const hCompact = h.replace(/\s/g, "");
  let best = 0;

  for (const synonym of FIELD_SYNONYMS[field]) {
    const s = normalizeHeader(synonym);
    const sCompact = s.replace(/\s/g, "");
    const specificity = Math.min(1, s.length / 18);

    let score = 0;
    if (h === s) {
      score = 1;
    } else if (hCompact === sCompact) {
      score = 0.97;
    } else if (h.includes(` ${s} `) || h.startsWith(`${s} `) || h.endsWith(` ${s}`)) {
      score = 0.82 + 0.12 * specificity;
    } else if (hCompact.includes(sCompact)) {
      score = 0.7 + 0.15 * specificity;
    } else if (sCompact.includes(hCompact) && hCompact.length >= 3) {
      score = 0.66 + 0.1 * specificity;
    } else {
      score = 0.62 * jaccard(hTokens, tokens(s));
    }

    if (score > best) best = score;
  }

  return Math.min(best, 1);
}

/**
 * Globally assign headers to fields.
 *
 * Greedy over all (header, field) pairs sorted by score, so the strongest evidence
 * claims its column first and a weaker competing field cannot steal it. One header
 * maps to at most one field and vice versa.
 */
export function induceProfileHeuristic(headers: readonly string[]): InducedProfile {
  interface Candidate { field: CanonicalField; index: number; score: number }
  const candidates: Candidate[] = [];

  headers.forEach((header, index) => {
    for (const field of CANONICAL_FIELDS) {
      const score = scoreHeaderAgainstField(header, field);
      if (score >= 0.5) candidates.push({ field, index, score });
    }
  });

  candidates.sort((a, b) => b.score - a.score);

  const columnMap: ColumnMap = {};
  const scores: Partial<Record<CanonicalField, number>> = {};
  const usedIndexes = new Set<number>();

  for (const c of candidates) {
    if (columnMap[c.field] !== undefined || usedIndexes.has(c.index)) continue;
    columnMap[c.field] = c.index;
    scores[c.field] = Number(c.score.toFixed(3));
    usedIndexes.add(c.index);
  }

  const missingRequired = REQUIRED_FIELDS.filter((f) => columnMap[f] === undefined);

  // Confidence is driven entirely by the required fields; optional columns are a
  // bonus and must not be able to mask a missing policy number.
  let confidence = 0;
  if (missingRequired.length === 0) {
    const requiredScores = REQUIRED_FIELDS.map((f) => scores[f] ?? 0);
    confidence = requiredScores.reduce((a, b) => a + b, 0) / requiredScores.length;
  }

  return { columnMap, confidence, method: "heuristic", missingRequired, scores };
}

/**
 * LLM escalation for layouts the heuristic cannot resolve.
 *
 * Deliberately an interface rather than an implementation: Stage 0 runs without an
 * API key, and every code path must degrade to a clear, non-silent failure instead
 * of a guessed column map. Wiring this up is Stage 5 work.
 */
export interface ProfileInducer {
  induce(headers: readonly string[], sampleRows: readonly string[][]): Promise<InducedProfile>;
}

export class UnavailableInducer implements ProfileInducer {
  async induce(): Promise<InducedProfile> {
    throw new Error("LLM profile induction is not configured in this environment");
  }
}
