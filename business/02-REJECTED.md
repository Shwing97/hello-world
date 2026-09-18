# Killed during research (and why)

These consumed real research time. Recording them so we do not re-litigate them.

## 1. Certificate-of-Insurance (COI) tracking for small GCs / property managers — REJECTED

Looked excellent at first. **EVIDENCE:** myCOI is described as $500–$2,000+/mo with annual contracts and a **200-certificate minimum** — explicitly excluding small operators. Classic underserved-small-end setup.

**Why it died:** the low end is already taken, and taken cheaply.
- **EVIDENCE:** BCS publishes self-service COI tracking at **$0.95/vendor/month**, starting free, no credit card, with AI certificate review in every tier.
- **EVIDENCE:** TrustLayer launched a **free Starter plan up to 50 vendors** in 2025.

A small GC with 40 subs is served for $0–$38/mo by funded incumbents. There is no room to enter above that, and entering below it is not a business. **Kill criterion met before we spent anything.**

## 2. Prevailing-wage / Davis-Bacon wage-determination monitoring — REJECTED

**FACT:** FAR 22.404-6 and 22.1012-1 state that monitoring for revised wage determinations "can be accomplished by use of the Wage Determinations at SAM.gov website's **Alert Service**."

The government ships the alerting product for free. Dead on arrival.

(Certified payroll *reporting* is a separate, live problem — **EVIDENCE:** LCPtracker-adjacent tooling is cited at $200–$600/mo — but **FACT:** LCPtracker is provided free to IIJA award recipients, and the residual segment is contractors running one or two jobs who are content hand-filling form WH-347. Thin.)

## 3. Healthcare exclusion screening (OIG LEIE + SAM + state Medicaid) — REJECTED, narrowly

This was my strongest mid-research candidate and it is worth understanding why it failed, because the underlying observation is still valuable.

**The genuine information asymmetry — FACT/EVIDENCE:** 44 states plus DC maintain their own Medicaid exclusion lists in addition to the federal LEIE. Each uses its own program name, file format (Excel, PDF, searchable database, or flat text) and update schedule. A majority of state-level exclusions never appear on the federal LEIE, and most state records lack an NPI, making automated federal matching impossible.

**The obligation is recurring and penalty-backed — FACT/EVIDENCE:** OIG's May 2013 guidance sets the monthly screening expectation (the LEIE updates monthly); monthly screening is mandatory in at least 14 states; CMS expects monthly screening against all sources. Overpayments must be reported and returned within 60 days with a six-year lookback, and retention past that window becomes a False Claims Act obligation with treble damages and per-claim civil penalties.

**Why it died anyway:** the price ceiling is already on the floor.
- **EVIDENCE:** Accountable HQ publishes **Basic at $30/mo** (LEIE + SAM + 1 state list) and **Premium at $40/mo** covering **all 46 state Medicaid lists**, monthly, with alerts.
- **EVIDENCE:** ExclusionScreening.com publishes plans **from $30/mo**.
- **EVIDENCE:** the market rate for automated screening is cited at **$2–$5 per individual per month**.

So the hardest part (44 fragmented state lists) is already commoditised at $40/mo by a funded incumbent, while the enterprise tier ($15k–$200k/yr for ProviderTrust/Verisys) is unreachable without a sales team. We would be a me-too product in a market with no pricing power.

**Salvaged insight worth keeping:** the *normalised 44-state exclusion dataset itself* is a picks-and-shovels product — every one of the ~10 screening vendors must independently build and maintain it. Selling that feed at $300–$500/mo to 5–10 vendors would hit $1.5k–$5k/mo with near-zero support. It is parked, not dead. Its weakness is that it is a sell-to-your-competitors play with a tiny, non-self-serve buyer pool.

## 4. CRE lease abstraction — REJECTED

**EVIDENCE:** already collapsed to $10–$15/lease pay-as-you-go and ~$25/export (LeaseLens), against $150–$400/lease for human services. AI has already eaten the margin; we would be arriving after the price war, and it is transactional, not recurring.

## 5. Utility rate / tariff data (solar, energy brokers) — REJECTED

**EVIDENCE:** Genability (now Arcadia) maintains the comprehensive US electricity tariff database and rate engine. The moat *is* a decade of hand-maintained tariff data. Not replicable by a solo operation.

## 6. Heavy-equipment valuation / auction comparables — REJECTED

**EVIDENCE:** EquipmentWatch at $300–$500/mo, Rouse at ~$5k–$6k/yr, Rouse dealer-only. High willingness to pay confirmed — but the product *is* proprietary transaction data from auction houses. We have no route to that data, and scraping it is legally fraught. Fails on data access, not on demand.

## 7. POS → accounting bridges (Toast → QuickBooks etc.) — REJECTED

**EVIDENCE:** Shogo already covers this at **$1/day**, across most POS/accounting combinations, and is listed in the Toast and Shopify app stores. The pattern is validated — and occupied.

## 8. Small-importer tariff/HTS monitoring — REJECTED

The underlying volatility is real (**EVIDENCE:** Section 301 exclusions extended to Nov 2026; tariff stacking across s.122/232/301 plus AD/CVD). But a wave of free calculators already ranks (`ustariffrates.com`, `tariffcheck.co`, paidnice's calculator). Free tools with no visible monetisation are the worst possible competitor. Also: extreme policy churn makes maintenance cost unbounded.

## 9. Packaging EPR (CA SB 54, OR, CO, MN) — PARKED

**FACT/EVIDENCE:** SB 54 registration deadline 1 Jun 2026, baseline report 1 Jul 2026, penalties to $50,000/day for willful non-compliance; Oregon reports due 31 Mar annually; Colorado live 1 Jan 2026. Real, new, penalty-backed.

**Why parked, not chosen:** four of the states designated the *same* PRO (Circular Action Alliance), which consolidates the reporting, and the obligation is *annual*. Annual = one panic per year = weak recurring value and high churn. `epratlas.com` already exists.

## 10. Backflow test-report filing for testers — REJECTED

Genuine fragmentation (every water purveyor has its own form and portal). But the purveyor mandates the portal, so the tester cannot choose our software — and SwiftComply, BSI Online, Tokay, BackflowGo and NoBackflow already work both sides. No leverage.

## 11. Municipal bid-results / unit-price intelligence — PARKED

**EVIDENCE:** local opportunities "post separately through individual cities, counties, school districts and utility authorities"; contractors describe scouring "hundreds, if not thousands" of sites. Bid tabulations are public records, obtainable by FOIA where not posted. Real asymmetry, real SEO surface ("bid results [city]").

**Why parked:** the work is thousands of bespoke scrapers plus FOIA correspondence — i.e. **ongoing human ops**, which the owner mandate penalises heavily. Also ConstructConnect/BidNet/Dodge have sales teams and 825k-project databases.
