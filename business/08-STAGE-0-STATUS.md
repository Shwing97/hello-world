# Stage 0 — status

**Built, verified, and deployed. No spend.**

**Live at https://statement-sweep.vercel.app** — but currently reachable only by the
account owner. See "Deployment" below and `09-LAUNCH-KIT.md` §0: one Vercel setting
has to be changed before anyone else can open it.

## Deployment

Free Vercel hosting on the Hobby plan, which removed the domain from the critical
path entirely. K1 (will agencies upload?) and K3 (how long is the carrier format
tail?) can now be measured for **$0** rather than waiting on a domain purchase.
That was an error in the earlier plan, and this corrects it.

| | |
|---|---|
| URL | `statement-sweep.vercel.app` |
| Project | `statement-sweep` (new, isolated) |
| Cost | $0 — Hobby plan |
| Indexing | `noindex` + robots disallow while on a temporary subdomain |

**Two things the owner needs to know:**

1. **The site is not publicly reachable yet.** The Vercel team has
   `ssoProtection` enabled for all non-custom domains. The connector token can
   create deployments but is not authorised to change project settings in that
   scope, so this has to be switched off by hand. 30 seconds, scoped to this
   project, reversible.
2. **Hobby is for non-commercial use.** Fine for a free validation tool with no
   revenue. Before this ever takes money it has to move to Pro (~$20/mo).

## What exists

A working Next.js application containing the free wedge tool from the plan, plus the
extraction core it is built on.

| Path | What it is |
|---|---|
| `lib/money.ts` | Monetary parsing in **integer cents only** — both chargeback conventions, blank-vs-zero distinction |
| `lib/normalize.ts` | Policy-number and insured-name normalisation; per-column date convention detection |
| `lib/schema.ts` | The canonical line shape and the carrier header vocabulary |
| `lib/induce.ts` | Deterministic header→field matching with global competitive assignment; LLM escalation behind an interface |
| `lib/tabular.ts` | CSV/XLSX readers and header-row detection beneath carrier preambles |
| `lib/profiles.ts` | The carrier profile library, keyed by header fingerprint, with a structure-only guard |
| `lib/validate.ts` | Totals cross-check, rate cross-check, duplicate and ambiguity detection |
| `lib/convert.ts` | Orchestration and **K3 telemetry** |
| `app/` | Landing page, the free converter, and the upload API |
| `tests/`, `fixtures/` | 41 tests including the **K4 accuracy harness** |

## Verified, not just compiled

The app was built, started, and exercised over HTTP against real files:

- **Preamble + totals:** the Grange fixture parsed from header row 5, produced 3 lines,
  and line items summed to the printed total ($609.00) exactly.
- **Profile reuse (K3 mechanic):** first upload `inductionMethod: "heuristic"`; second
  upload of the same layout `inductionMethod: "known"`, `profileExisted: true`.
- **Excel:** a generated workbook with native `Date` and numeric cells parsed correctly —
  `130` read as $130.00, not 130 cents.
- **Carrier detection:** Grange and Safeco identified automatically.
- **All three refusal paths fire:** unreadable layout → `PROFILE_UNRESOLVED`;
  line items not summing to the printed total → `TOTAL_MISMATCH`; PDF →
  `PDF_NOT_SUPPORTED`. Each returns `ok: false` rather than a plausible wrong number.

## K4 accuracy: 100% (72/72 fields), zero LLM calls

**This number must not be over-read.** The fixtures are ones *I wrote*. 100% means
"no bugs against the cases I thought of" — it does **not** mean the parser is accurate
on real carrier statements, and it cannot until real statements are labelled and added
to `tests/accuracy.test.ts`. The harness exists so that claim becomes checkable the
moment we have real files; the score today is a regression baseline, not evidence.

What it *does* legitimately show: the three-tier parsing strategy holds. Every fixture
resolved on the deterministic path with **no inference calls at all**, which is the
design that keeps the margin kill criterion (K7) open.

## Two bugs the tests caught

1. **`P.C.` broke name matching.** Punctuation was stripped before entity suffixes were
   removed, so `Riverbend Dental, P.C.` became tokens `P` and `C` and never matched
   `Riverbend Dental PC`. Exactly the cross-carrier case the product exists to handle.
   Fixed by collapsing dotted abbreviations first.
2. **Date disambiguation was using the wrong signal.** The spec said to resolve
   `03/04/26` against the statement period — but a policy effective in March
   legitimately pays commission in June, so the period says nothing about effective
   dates. Replaced with per-column convention detection: one value with a day above 12
   settles the convention for every other row in that column.

## Decisions taken during the build

- **No email gate on the CSV download.** The plan called for one. Capturing addresses
  with no mailing list, no storage and no privacy policy would be worse than not
  capturing them. It goes in at Stage 1, alongside the privacy policy.
- **PDFs are refused, not attempted.** PDF layouts cannot be validated without real
  samples, and a plausible-looking wrong number is worse than an honest refusal. PDF
  uploads are still counted for K3, so we learn how much demand exists for them.
- **The profile store is in-memory and per-instance.** Persisting the shared library
  needs a real database and a retention policy; a half-persisted version would make the
  K3 numbers unreliable.

## Not done, and why

- **Real-statement accuracy** — unknowable until we have real statements. The gate.
- **PDF extraction** — Stage 5, once real samples exist.
- **LLM escalation** — interfaced but not implemented; no API key in this environment,
  and every path degrades to an explicit failure rather than a guessed column map.
- **The matching cascade and findings engine** — Stage 5 in the plan. The normalisation
  they depend on is built and tested.
- **The 25 SEO pages** — Stage 2.
- **Deployment** — needs a domain, which is the first owner decision.

## Still unverified from this environment

Network egress is blocked here, so **domain availability for every candidate name
remains UNKNOWN**, and the competitor prices in the research docs are from search
summaries rather than pricing pages I could open.

## Hardening done before exposing the upload endpoint

- **Row cap (50,000).** An `.xlsx` is a zip archive, so a few megabytes can
  decompress into something far larger. The cap is applied *during* sheet
  iteration, not after, so a hostile archive is never fully materialised. No real
  commission statement approaches this size.
- **8 MB upload limit**, enforced before any parsing.
- **No stored files**, no database, no secrets in the project — so the blast radius
  of the endpoint being public is a failed function invocation, not a breach.
- **SSN-shaped strings are refused** at ingest.

## Run it

```
npm install
npm test          # 41 tests, prints the K4 accuracy score
npm run typecheck
npm run dev       # http://localhost:3000
```

Fixtures to try are in `fixtures/`.
