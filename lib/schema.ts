/**
 * The canonical shape every carrier statement is normalised into, and the header
 * vocabulary used to get there.
 *
 * The synonym lists below are the beginning of the asset that makes this product
 * hard to copy. They grow every time an unseen statement is uploaded.
 */

export const CANONICAL_FIELDS = [
  "policyNumber",
  "insuredName",
  "commissionAmount",
  "premium",
  "commissionRate",
  "effectiveDate",
  "transactionType",
  "producerCode",
  "lineOfBusiness",
  "statementDate",
] as const;

export type CanonicalField = (typeof CANONICAL_FIELDS)[number];

/** Without these three a statement line cannot be reconciled against a book. */
export const REQUIRED_FIELDS: readonly CanonicalField[] = [
  "policyNumber",
  "insuredName",
  "commissionAmount",
];

export const FIELD_SYNONYMS: Record<CanonicalField, readonly string[]> = {
  policyNumber: [
    "policy number", "policy no", "policy #", "policy num", "policy nbr", "policy",
    "policy id", "pol no", "pol num", "polnbr", "contract number", "contract no",
    "certificate number", "cert no", "item number",
  ],
  insuredName: [
    "insured name", "insured", "named insured", "customer name", "customer",
    "client name", "client", "account name", "policyholder", "policy holder",
    "member name", "name",
  ],
  commissionAmount: [
    "commission amount", "commission amt", "commission paid", "commission due",
    "agent commission", "net commission", "gross commission", "comm amount",
    "comm amt", "commission", "comm", "commission earned", "amount paid",
  ],
  premium: [
    "written premium", "premium amount", "gross premium", "billed premium",
    "base premium", "annual premium", "premium", "prem",
  ],
  commissionRate: [
    "commission rate", "comm rate", "commission percent", "commission pct",
    "commission %", "comm %", "rate", "pct", "percent",
  ],
  effectiveDate: [
    "policy effective date", "effective date", "eff date", "eff dt", "effective",
    "inception date", "inception", "policy date",
  ],
  transactionType: [
    "transaction type", "transaction code", "trans type", "tran code", "trans code",
    "activity type", "activity", "transaction", "type",
  ],
  producerCode: [
    "producer code", "producer id", "writing agent", "sub producer", "subproducer",
    "producer", "agent code", "agent id", "agent",
  ],
  lineOfBusiness: [
    "line of business", "lob", "coverage type", "coverage", "policy type",
    "product", "line",
  ],
  statementDate: [
    "statement date", "paid date", "payment date", "process date", "processed date",
    "posting date", "post date", "check date",
  ],
};

export type TransactionType =
  | "new"
  | "renewal"
  | "endorsement"
  | "cancellation"
  | "chargeback"
  | "unknown";

/** Maps the short codes carriers actually print onto our vocabulary. */
export function classifyTransaction(raw: unknown, commissionCents: number | null): TransactionType {
  const s = String(raw ?? "").trim().toLowerCase();

  if (/(^|\b)(nb|new)\b/.test(s) || s.includes("new business")) return "new";
  if (/(^|\b)(rn|rw|ren)\b/.test(s) || s.includes("renew")) return "renewal";
  if (/(^|\b)(en|end)\b/.test(s) || s.includes("endorse")) return "endorsement";
  if (/(^|\b)(xl|can|cx)\b/.test(s) || s.includes("cancel")) return "cancellation";
  if (s.includes("chargeback") || s.includes("charge back") || s.includes("reversal")) {
    return "chargeback";
  }

  // A negative amount with no usable label is a chargeback in practice.
  if (s === "" && commissionCents !== null && commissionCents < 0) return "chargeback";

  return "unknown";
}

export interface CanonicalLine {
  sourceRow: number;
  policyNumberRaw: string;
  policyNumber: string;
  insuredNameRaw: string;
  insuredName: string;
  insuredNameSorted: string;
  commissionCents: number | null;
  premiumCents: number | null;
  commissionRate: number | null;
  effectiveDate: string | null;
  effectiveDateAmbiguous: boolean;
  transactionType: TransactionType;
  producerCode: string | null;
  lineOfBusiness: string | null;
  statementDate: string | null;
}

/** Column order for the CSV the free tool hands back. */
export const EXPORT_COLUMNS: readonly { key: keyof CanonicalLine; label: string }[] = [
  { key: "sourceRow", label: "Source Row" },
  { key: "policyNumberRaw", label: "Policy Number (as printed)" },
  { key: "policyNumber", label: "Policy Number (normalized)" },
  { key: "insuredNameRaw", label: "Insured (as printed)" },
  { key: "insuredName", label: "Insured (normalized)" },
  { key: "effectiveDate", label: "Effective Date" },
  { key: "transactionType", label: "Transaction Type" },
  { key: "lineOfBusiness", label: "Line of Business" },
  { key: "producerCode", label: "Producer" },
  { key: "premiumCents", label: "Premium" },
  { key: "commissionRate", label: "Commission Rate" },
  { key: "commissionCents", label: "Commission" },
  { key: "statementDate", label: "Statement Date" },
];
