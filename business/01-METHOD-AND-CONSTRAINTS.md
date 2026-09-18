# Research method, evidence standards, and environment constraints

## Evidence labelling used throughout

| Label | Meaning |
|---|---|
| **FACT** | Verifiable from a primary/neutral source (statute, regulator, published price list). |
| **EVIDENCE** | Real observed signal, but from an interested party (vendor blog, competitor comparison page) or a secondary summary. Directionally useful, not trustworthy as a number. |
| **ASSUMPTION** | My inference from structure. Not observed. |
| **HYPOTHESIS** | Explicitly untested. Requires an experiment before spending money. |
| **UNKNOWN** | I could not determine it, and I say so. |

I have not fabricated any market size, search volume, competitor revenue, or willingness-to-pay figure.

## What I could and could not research

The execution container's network egress is locked down. Verified directly:

- `WebSearch` works (routed through Anthropic).
- `WebFetch` is **blocked for every domain tested** (`oig.hhs.gov`, `en.wikipedia.org`, `accountablehq.com`, `exclusionscreening.com`) — `EGRESS_BLOCKED`.
- Direct `curl` to the open internet is blocked (`CONNECT tunnel failed, 403`), including `reddit.com`, `sam.gov`, `data.cms.gov`, `capterra.com`, `apps.shopify.com`.

**Consequence 1 (research):** I could not read Reddit/forum threads first-hand, and could not open competitor pricing pages directly. Everything below rests on search-engine result summaries plus quoted excerpts. That is weaker than primary reading, so competitor pricing is labelled EVIDENCE, not FACT, unless it appeared as an explicit published price.

**Consequence 2 (build):** any product that ingests third-party data **cannot be developed or tested against live sources from inside this container.** Production hosting (Vercel/Render/Fly) has normal egress, so this affects the dev loop, not the product. Fixtures + recorded samples will be needed for local work.

**This is a real constraint the owner should know about before we commit to a data-ingestion-heavy product.**

## Search passes run

Roughly 20 searches across: COI/vendor-insurance compliance, Davis-Bacon certified payroll, FMCSA drug & alcohol clearinghouse, nonprofit grant tracking, small-importer tariff/HTS tooling, packaging EPR (SB 54 / Oregon / Colorado / Minnesota), insurance carrier commission reconciliation, POS→accounting bridges, heavy-equipment valuation data, prevailing-wage monitoring, healthcare exclusion screening (OIG LEIE / SAM / state Medicaid), IOLTA trust reconciliation, utility tariff data, municipal bid tabulations, CRE lease abstraction, backflow test reporting, and small-agency insurance software spend.

## The filter applied

An opportunity had to show **money already moving** (published software prices, paid labour hours, freelancer fees), a **recurring** trigger, data or workflow that is **genuinely hard to assemble**, **self-serve-compatible distribution**, and a path to $1k/mo at **fewer than ~40 customers**. Anything requiring demos, an audience, inventory, or ongoing manual fulfilment was penalised heavily.
