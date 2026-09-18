# Product specification — commission statement reconciliation

**Status: plan only. No product code is to be written until this is approved.**

Everything here is designed around one hard constraint from the research: **document
parsing is a ~$39/month commodity.** So the parser is treated as plumbing, and all
the defensible engineering effort goes into the two things a horizontal tool has no
reason to build — the **matching cascade** and the **carrier profile library**.

---

## 1. The two products, and why there are two

### 1a. The wedge — *Commission Statement → Clean CSV* (free)
A single-purpose public utility. Upload a carrier commission statement in any
format; get back clean, columnar data.

It exists for three reasons, in order of importance:

1. **It measures kill criterion K3 before we build anything expensive.** Every
   upload tells us the carrier, the format, and whether we already had a profile
   for it. After ~200 uploads we know the real shape of the format tail — the risk
   that decides whether this business works at all.
2. It is the SEO and acquisition engine (see `07-GO-TO-MARKET.md`).
3. It builds the carrier profile library, which is the paid product's moat.

No account needed to parse. Email required to download the CSV. That is the lead
capture and it is an honest trade — they get real work done, we get an address.

### 1b. The paid product — *Monthly Reconciliation*
Upload a book-of-business export plus the month's statements; get back matched
lines, variances, and suspected non-payments.

---

## 2. Architecture

Chosen for the lowest possible operating burden, not for elegance.

| Layer | Choice | Why |
|---|---|---|
| App | Next.js (App Router), TypeScript | one deployable, server actions, good SEO control |
| Hosting | Vercel | zero-ops, preview deploys, a Vercel connector already exists on this account |
| Database | Postgres (Neon or Supabase) | relational fits the matching problem; generous free tier |
| File storage | Vercel Blob or Cloudflare R2 | short-lived storage, lifecycle-delete built in |
| Jobs | Vercel Cron + a queue table | avoids running a broker; reconciliation is not latency-sensitive |
| Payments | Stripe Checkout + Billing Portal | self-serve signup, self-serve cancel, no human in the loop |
| LLM | Claude — Sonnet 5 for volume parsing, Opus 5 for profile induction | see §4 |
| Email | Resend or Postmark | transactional + lifecycle |
| Analytics | PostHog (self-serve, free tier) | funnel + the K1/K3 instrumentation |
| Errors | Sentry | feeds the monitoring agent |

**Deliberately excluded from v1:** no AMS integrations, no IVANS, no webhooks, no
mobile app, no SSO, no multi-user permissions. Every one of those is a request that
will arrive, and every one is a "later".

---

## 3. Data model (core tables)

```
tenant            id, name, plan, stripe_customer_id, retention_days
user              id, tenant_id, email, role
book_import       id, tenant_id, uploaded_at, row_count, source_label
policy            id, tenant_id, book_import_id, policy_number_raw,
                  policy_number_norm, insured_name, insured_name_norm,
                  carrier_name, carrier_id, line_of_business, effective_date,
                  expiration_date, premium, expected_rate, producer_code
carrier           id, canonical_name, aliases[]              -- global, not per-tenant
carrier_profile   id, carrier_id, format (pdf|xlsx|csv), version,
                  column_map jsonb, extraction_hints jsonb,
                  confidence, sample_count, created_by (llm|human)
statement         id, tenant_id, carrier_id, period_start, period_end,
                  file_key, profile_id, parse_status, line_count
statement_line    id, statement_id, policy_number_raw, policy_number_norm,
                  insured_name, insured_name_norm, effective_date,
                  premium_reported, commission_rate_reported,
                  commission_amount, transaction_type
match             id, statement_line_id, policy_id, tier, confidence,
                  status (auto|needs_review|confirmed|rejected)
finding           id, tenant_id, period, type, severity, policy_id,
                  statement_line_id, expected, actual, delta, explanation
```

`carrier` and `carrier_profile` are **global, not tenant-scoped.** That is the
compounding asset: every agency that uploads a Travelers statement makes the
product better for every other agency. It is also the reason marginal cost falls
over time.

---

## 4. Parsing strategy — spend the LLM budget where it earns its keep

The naive approach (throw every page at an LLM) is slow, expensive, and
non-deterministic on exactly the numbers that must be right. Three-tier instead:

**Tier 1 — Structured files with a known profile (target: the large majority of volume).**
XLSX/CSV from a carrier we have seen before. Apply the stored `column_map`
deterministically. **Zero LLM calls. Zero variance between runs.**

**Tier 2 — Structured files, unknown profile.** One Opus call to *induce* the
profile: given the header row and 20 sample rows, emit a column map. Persist it as
a `carrier_profile`. Every subsequent statement from that carrier drops to Tier 1.
**One LLM call amortised across all future statements from that carrier, for every
tenant.**

**Tier 3 — PDFs.** Text-layer extraction first (`pdf-parse`); only fall back to
vision when there is no text layer. Sonnet 5 with a strict structured-output schema,
chunked by page, with a deterministic post-pass that re-validates every number.

**Non-negotiable validation rules, applied to all tiers:**
- Line-item commission amounts must sum to the statement total where a total exists;
  mismatch → the statement is flagged, never silently accepted.
- Every monetary field must re-parse as a decimal. Never trust a model's arithmetic.
- Dates normalised to ISO; ambiguous formats (`03/04/25`) resolved against the
  statement period, not guessed.
- A parse below the confidence floor goes to a review queue. **We would rather show
  nothing than show a wrong number** — see the accuracy-liability risk.

**Cost control:** Tier 1 is free. This is what keeps kill criterion K7
(inference cost > 25% of MRR) from firing.

---

## 5. The matching cascade — this is the actual product

Policy numbers are not stable identifiers. Carriers reformat them, agencies re-key
them, renewals change them. So match in descending confidence and stop at the first
tier that hits.

**Normalisation, applied to both sides before any comparison:**
- policy number → uppercase, strip all non-alphanumerics, strip leading zeros,
  strip known carrier-specific prefixes/suffixes held in `carrier.aliases`
- insured name → uppercase, strip punctuation and entity suffixes
  (`LLC`, `INC`, `DBA`, `&`/`AND`), sort tokens

| Tier | Rule | Confidence |
|---|---|---|
| 1 | exact normalised policy number, same carrier | 1.00 |
| 2 | normalised policy number + effective date within ±45 days | 0.95 |
| 3 | fuzzy insured name (Jaro-Winkler ≥ 0.92) + carrier + effective date window | 0.85 |
| 4 | premium amount exact + carrier + period, single candidate only | 0.75 |
| 5 | no match → **review queue** | — |

Tier 4 only fires when it is unambiguous. **Never guess between two candidates —
send it to review.** A wrong match produces a wrong dollar figure, and a wrong
dollar figure sent to a carrier is the reputational failure mode that kills us.

### Findings generated
| Type | Rule |
|---|---|
| `rate_variance` | `\|actual − expected\| > max($5, 2% of expected)` |
| `missing_payment` | active policy, commission expected this period, no statement line |
| `unmatched_line` | statement line with no policy in the book |
| `chargeback` | negative amount; reconciled against the prior positive where findable |
| `duplicate_payment` | same policy + period paid twice |
| `rate_drift` | this carrier's effective rate has moved vs. its own trailing median |

**On `expected_rate` — the honest design problem.** We cannot know a contracted
commission rate unless the agency tells us. v1 therefore infers it as the **trailing
median rate for that carrier + line of business** across the tenant's own history,
and lets the user override per carrier. Two consequences, both stated plainly to
the customer:

- **Month 1 is weak.** With no history, only structural findings (missing payments,
  duplicates, unmatched lines) are reliable; rate variance needs a baseline.
- **The product gets better every month it runs.** That is a real retention
  mechanic, and it is also the honest reason not to promise month-one miracles.

---

## 6. Security and data handling

Statements carry insured names and policy numbers. This is PII, not PHI — but the
bar is still real, and it is a buying objection we will be asked about on day one.

- TLS in transit; encryption at rest; per-tenant row-level isolation.
- **Configurable retention, default 90 days.** Original files deleted on schedule;
  derived data retained until the tenant deletes it.
- One-click "delete everything", executed, not queued.
- **Customer data is never used to train models.** Stated in the ToS.
- SSN-shaped strings are detected and redacted at ingest — they should not be in a
  commission statement, and if one appears we do not want it.
- Carrier profiles derived from customer files contain **structure only** (column
  positions, header names, formatting quirks) — never customer values. This must be
  enforced in code, because it is what makes the global profile library legitimate.
- A DPA template offered from launch. Owner signs; agents do not.

---

## 7. Scope discipline

### MUST HAVE (v1)
1. Free statement → CSV converter with format instrumentation
2. Book-of-business CSV/XLSX import with column mapping UI
3. Statement upload (PDF/XLSX/CSV), multi-file
4. Matching cascade with a review queue for anything below Tier 3 confidence
5. Findings report: rate variance, missing payment, unmatched, chargeback, duplicate
6. CSV/XLSX export of everything
7. Stripe self-serve checkout, billing portal, cancellation
8. Docs + FAQ

### LATER
Producer split calculation · multi-client view for bookkeeping firms · month-over-
month trend reporting · saved per-carrier rate tables · carrier dispute letter
drafts · Slack/email digests · AMS-specific export formats

### DO NOT BUILD YET
Anything that **writes into an AMS**. Anything that **contacts a carrier on the
agency's behalf**. Both convert us from a reporting tool into a party to the
agency's carrier relationship — enormous liability for no near-term revenue.

---

## 8. Instrumentation — every kill criterion must be measurable from day one

| Criterion | Event to capture | Where it shows |
|---|---|---|
| K1 upload behaviour | `landing_view` → `file_uploaded` | PostHog funnel |
| K2 payment intent | `pricing_view` → `checkout_started` → `paid` | Stripe + PostHog |
| **K3 format tail** | on every upload: `carrier_id`, `format`, `profile_existed` (bool) | **rolling 25-agency window — the number that decides the business** |
| K4 accuracy | held-out labelled statement set, scored per release | CI |
| K5 distribution | indexed pages, impressions, position | Search Console |
| K7 margin | LLM spend per tenant ÷ tenant MRR | monthly report |
| K8 support | human-escalated minutes per tenant per month | support tool |

K3 is the one I expect to fire. It must be visible on the owner dashboard from the
first upload, not retrofitted later.

---

## 9. Naming

Candidates: **Statement Sweep**, **Commission Ledger**, **ReconRail**, **Bookmatch**.

**UNKNOWN: domain availability.** This container's network egress is blocked, so I
cannot check a single domain from here. That check is one of the first things to do
in an environment with normal network access, or by you directly.
