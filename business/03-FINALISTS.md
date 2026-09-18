# Finalists

Four survived. #1 is the recommendation; #2–#4 are genuine runners-up recorded with their specific flaws so we can revisit them if #1 hits a kill criterion.

---

# FINALIST 1 — Carrier commission-statement reconciliation for small & mid independent insurance agencies  ★ RECOMMENDED

## The customer
The owner, office manager, or bookkeeper of a **US independent insurance agency** — P&C or employee benefits — with roughly **3–25 staff** and **200–2,000 commission line-items per month**, running HawkSoft, EZLynx, AMS360, Applied Epic, Agency Matrix, or nothing but QuickBooks.

Secondary and possibly better customer: the **outsourced bookkeeping firms that specialise in insurance agencies**. One relationship brings 5–20 agencies.

## The problem
Every month, 10–40 carriers send commission statements in mutually incompatible formats — a 40-page PDF from one, an Excel file with bespoke column headers from another, a CSV with abbreviated field names from a third. Someone has to normalise all of it and match every line to the agency's own book of business to find:

- policies paid at the **wrong commission rate**
- policies **not paid at all**
- unexpected **chargebacks**
- the **producer split** owed on each line

Underpayment is *silent*. An agency that does not reconcile never finds out it was shorted. This recurs every single month, forever.

## Current solution
- **Excel.** Export from the AMS, open the statement, VLOOKUP / INDEX-MATCH.
- A part-time bookkeeper or offshore VA doing side-by-side comparison.
- A $400–$800/mo dedicated platform.
- AMS-native reconciliation — which only works for carriers on an electronic feed.

## Evidence

- **EVIDENCE (vendor — Applied Systems):** "the typical independent agency spends **40 to 80 hours per month** on commission reconciliation — one to two full-time employees doing nothing but side-by-side spreadsheet comparison." *Marketing copy from a company selling the fix; treat the number as inflated. Its value is that a major incumbent is investing in the category.*
- **EVIDENCE (published prices — Capterra):** Commission Tracker at **$67/mo** (independent agents), **$72/mo** (small agencies), **$119/mo** (medium), **$187/mo** flat-rate. Willingness to pay at this price point is demonstrated, not assumed.
- **EVIDENCE:** dedicated commission-reconciliation platforms cited at **$400–$800/mo ($4,800–$9,600/yr)**.
- **EVIDENCE (the exact failure mode, independently described):** "VLOOKUP doesn't handle policy number format differences… doesn't account for fuzzy name matching ('John Smith' vs 'Jon Smith')… requires manual setup for every carrier, every month."
- **EVIDENCE (the structural gap):** AMS platforms "have commission reconciliation features, but they typically only work with carriers that send electronic data feeds via **IVANS** or similar — **not all carriers do**."
- **EVIDENCE (the normalisation is the hard part, not the comparison):** "The most time-consuming part of manual reconciliation is not the comparison — it is the data normalization."
- **EVIDENCE (baseline software spend):** EZLynx from **$350/mo**, HawkSoft from **$250/mo**. A $100–$180/mo add-on is a normal-sized line item for this buyer.
- **EVIDENCE (live competitor set = live demand):** Applied Recon, Commission Tracker, Commission Wizard, Insurstein, Neudash, PolicyBalanceHub, BrokerageAudit all market to this problem in 2026.
- **UNKNOWN:** the number of US independent agencies. I could **not** verify the commonly-quoted ~36,000 figure and will not repeat it. The only datapoint I could stand behind is that **Smart Choice alone claims a network of 12,000+ independent agencies** (EVIDENCE), which sets a floor, not a market size.

## Competition
| Who | Position | Weakness we exploit |
|---|---|---|
| Applied Recon | Native to Applied Epic | Locked to Epic; irrelevant to the ~majority of small agencies |
| AMS-native (EZLynx, AMS360, HawkSoft) | Bundled | Only handles IVANS-fed carriers |
| Commission Tracker ($67–$187) | Commission *tracking* & producer payouts | Does not solve statement parsing/normalisation |
| Dedicated platforms ($400–$800) | Full end-to-end | Priced and implemented for mid/large agencies |
| Excel | Free | Breaks on format drift and fuzzy names |

## Market gap
Two, and they are specific:

1. **The $180–$400/mo band is empty.** Below it sit commission *trackers* (record-keeping). Above it sit implementation-heavy platforms. Nothing self-serve attacks the actual hard part — turning 25 incompatible statements into matched lines — at a small-agency price.
2. **Everything meaningful is coupled to an AMS or to IVANS.** We can be deliberately **AMS-agnostic**: upload any book export, upload any statement. No integration, no implementation call, no demo. That decoupling is precisely what makes the product self-serve, which is what makes the *business* fit the owner mandate.

## Product
**"Upload your carrier statements and your book export → get a reconciliation report."**

Outputs: matched lines; unmatched / unpaid policies; rate variances; chargebacks; producer-split sheet; clean CSV back into the AMS or QuickBooks. The compounding asset is the **per-carrier parser library** — every new statement format we learn makes the product harder to replace and cheaper to serve.

## Pricing (HYPOTHESIS — to be tested, not assumed)
| Tier | Price | Scope |
|---|---|---|
| Free | $0 | 1 statement/mo → clean CSV. Acquisition wedge. |
| Solo | $79/mo | up to 300 lines/mo |
| Agency | $179/mo | up to 2,000 lines, unlimited carriers, variance detection, history |
| Firm | $349/mo | multi-location / bookkeeper multi-client |

## $1,000/month math
- 6 × Agency @ $179 = **$1,074**, or
- 13 × Solo @ $79 = **$1,027**, or
- realistic mix: 4 Agency + 5 Solo = **$1,111**

## $5,000/month math
- 28 × Agency @ $179 = **$5,012**, or
- 20 Agency + 5 Firm = **$5,325**

**Under 30 paying customers for the second goal.** This is the single most important number in this document.

## Customer acquisition
1. **Free tool as the wedge** — *"Insurance commission statement PDF → Excel."* High intent, genuinely useful standalone, and it feeds us exactly the training data (real statement formats) the paid product needs.
2. **Programmatic SEO** — one page per carrier ("How to reconcile a [Carrier] commission statement"), hundreds of carriers; plus one page per AMS ("commission reconciliation for HawkSoft / EZLynx / AMS360").
3. **Comparison pages** against each named competitor.
4. **Bookkeeping-firm channel** — firms specialising in insurance-agency books; one signup, many agencies.
5. **Agency-owner communities** — useful content, not spam.

No cold calls. No demos. No conference booths.

## Automation (what Claude/software runs)
Statement parsing · matching engine · report generation · onboarding · billing & dunning · docs & FAQ · tier-1 support · lifecycle email · SEO content · error monitoring · competitor monitoring · churn detection · owner reporting. **New carrier format → the agent writes a parser from the uploaded sample and ships it.** That is the one loop that would otherwise be a human job, and it is automatable.

## Owner involvement
- Up front: form the entity, open Stripe, approve domain + hosting (~$30–60/mo), approve the pricing table.
- Ongoing: approve refunds over a threshold, approve price changes, sign anything legal, read a monthly report.
- **Estimated steady state: under 2 hours/month.**

## MVP (and nothing more)
1. Upload PDF/XLSX/CSV statement → normalised line items
2. Upload book export → fuzzy match on policy number + insured name + effective date
3. Variance + missing-policy report
4. CSV export
5. Stripe self-serve checkout

**LATER:** producer splits, multi-client bookkeeper view, AMS integrations, dispute letters.
**DO NOT BUILD YET:** anything that writes back into an AMS, anything that contacts a carrier on the agency's behalf.

## Validation (before meaningful build)
Behaviour, not opinions. Money, not compliments. See `04-THESIS-AND-PLAN.md`.

## Risks — the skeptical case
- **It is crowded.** Seven-plus named competitors. We are betting on *positioning* (self-serve, AMS-agnostic, mid-price), not novelty. If one incumbent launches a $99 self-serve tier, our wedge closes.
- **The carrier format long tail may be the whole business.** If every new agency arrives with 5 formats we have never seen, support cost never amortises and margins die. **This is the #1 technical risk and validation must measure it explicitly.**
- **Trust barrier.** Conservative buyers, money-touching product, no brand. Uploads may simply not happen without social proof.
- **Accuracy liability.** A false "you were underpaid" sent to a carrier damages the agency's relationship. We must position strictly as *flagging for human review*, never as authoritative.
- **PII.** Statements carry insured names and policy numbers. Not PHI, but it demands real security hygiene, a DPA, and deletion controls.
- **"Good enough" Excel.** It is documented that under ~200 lines/month, spreadsheets are acceptable. Our Solo tier may simply not convert.
- **SEO is slow** — 3–9 months. This is not a fast business.

## Autonomy assessment (honest)
| Function | Autonomy | Human still needed for |
|---|---|---|
| Acquisition | High | approving spend if we ever buy ads |
| Sales | **Full** | nothing — self-serve by design |
| Onboarding | **Full** | nothing |
| Fulfilment | High | edge-case statements that fail parsing |
| Billing | **Full** | refunds over threshold |
| Support | Medium-High | angry customers; accuracy disputes |
| Retention | High | nothing |
| Marketing | High | brand/positioning calls |
| Engineering | High | architecture decisions, security review |
| Monitoring | **Full** | incident decisions |
| Reporting | **Full** | reading it |

**Not automatable:** entity formation, banking, tax, the DPA/ToS, security incident response, and the judgement call when a customer disputes a number. Everything else is genuinely agent-operable.

---

# FINALIST 2 — Normalised multi-state exclusion-list data feed (picks & shovels)

**Customer:** the ~10 compliance-screening vendors (Accountable HQ, Vetty, gcheck, Etactics, Medtrainer, Streamline Verify, Ethico…) plus healthcare background-check firms and credentialing platforms — each of whom independently builds and maintains the same dataset.

**Problem:** **FACT/EVIDENCE:** 44 states + DC publish separate Medicaid exclusion lists, each with its own name, format (Excel / PDF / searchable DB / flat text) and update cadence; most records lack an NPI. Every vendor rebuilds this plumbing.

**Current solution:** each vendor's own scraper fleet, maintained forever.

**Competition:** UNKNOWN — I could not identify a vendor selling this as a standalone normalised feed. That is either a gap or a signal that nobody wants to buy it.

**Product:** a normalised, deduplicated, NPI-enriched, versioned daily feed + API of all federal and state exclusion sources, with provenance and change-deltas.

**Pricing (HYPOTHESIS):** $300–$500/mo. **$1k = 3 customers. $5k = 12 customers.**

**Acquisition:** direct, targeted, low-touch outbound to a known finite list of ~30 companies.

**Why it is not #1:** it violates the owner mandate in one specific way — a ~30-company total market is *not* a self-serve discover→sign-up→pay motion. It needs relationship selling. It is also a sell-to-your-competitors play, and any buyer can decide to keep building it themselves. **Kept on the shelf because the economics per customer are outstanding and the support burden is near zero.**

---

# FINALIST 3 — Municipal & local public-works bid-results / unit-price intelligence

**Customer:** small-to-mid civil and specialty contractors (paving, utilities, concrete, electrical) bidding city / county / school-district / water-district work.

**Problem:** **EVIDENCE:** local opportunities and their results "post separately through individual cities, counties, school districts and utility authorities"; contractors describe having to "scour hundreds, if not thousands of city, state, county and municipal websites." Bid tabulations reveal competitors' actual unit prices — the single most valuable input to pricing the next bid — and they are public records, FOIA-able where not posted.

**Competition:** ConstructConnect (825k-project database), BidNet Direct, Govcb, DOTestimate (state DOTs only). **Gap:** they sell *opportunities*; state-DOT results are covered; **local/municipal awarded unit prices are weakly aggregated.**

**Pricing (HYPOTHESIS):** $99–$249/mo regional. **$1k = 7 customers. $5k = 34 customers.**

**Acquisition:** exceptional programmatic SEO surface — "[city] bid results", "[agency] bid tabulation", "[item] unit price [state]".

**Why it is not #1:** it is thousands of bespoke, brittle scrapers plus FOIA correspondence — **ongoing human ops**, which the mandate penalises hardest. Revisit only if #1 dies.

---

# FINALIST 4 — Packaging EPR compliance workspace for mid-size consumer brands

**Customer:** consumer-goods brands above the de-minimis threshold selling into CA, OR, CO, MN, ME, MD.

**Problem:** **FACT/EVIDENCE:** CA SB 54 regulations effective 1 May 2026, producer registration due 1 Jun 2026, baseline data report due 1 Jul 2026, penalties **up to $50,000/day** for willful non-compliance; Oregon annual reports due 31 Mar with fees invoiced in July; Colorado live 1 Jan 2026. Compiling per-SKU packaging bills of materials by weight and material type is the genuinely hard part, and BOMs must be refreshed whenever packaging changes.

**Competition:** `epratlas.com`; enterprise EPR/ESG suites; Circular Action Alliance is the designated PRO in four states, which consolidates the *filing*.

**Pricing (HYPOTHESIS):** $150–$400/mo.

**Why it is not #1:** the obligation is **annual**. Annual compliance = one panic per year = weak recurring value, high churn, and a product people cancel in month two. Real penalties, wrong cadence.
