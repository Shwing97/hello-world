# Wave 2 — broader search after the first shortlist was declined

You asked for more options before committing. I ran a second research pass across
territory the first pass never touched: aviation, veterinary/DEA, beverage alcohol,
real-estate appraisal, manufacturing chemical compliance, nonprofit registration,
dental operations, death care, childcare, agriculture, field-service marketplaces,
music royalties, restaurant cost control, employee benefits, trucking settlements,
and multi-site utility billing.

**Honest headline: wave 2 did not beat the wave-1 recommendation.** Below is what
died, the meta-finding that matters more than any individual idea, and the three
live candidates it did produce.

---

## Killed in wave 2

| Opportunity | Why it died |
|---|---|
| **Aviation AD compliance tracking** | **EVIDENCE:** ADLog serves a single piston owner at **$43/year**. Fleet platforms (CAMP, Veryon, Flightdocs) are $150–$500/aircraft/month but sales-led with annual contracts. The segment we could reach self-serve pays $43/yr. No business. |
| **Veterinary / dental DEA controlled-substance logs** | Occupied: VetSnap (PIMS-integrated digital log), CUBEX (biometric cabinets + automated logs). |
| **Craft brewery TTB reporting** | Occupied and consolidating — **EVIDENCE:** Ekos and Ollie are both now owned by Next Glass (Ekos acquired Oct 2025), converging into one platform. Both already generate the Brewer's Report of Operations and excise returns. |
| **Appraisal / UAD 3.6 transition** | Real disruption (**FACT:** all Fannie/Freddie appraisals must comply by **2 Nov 2026**; one dynamic format replaces 12 legacy forms). But **EVIDENCE:** TOTAL by a la mode, Appraise-It Pro and ACI Sky have already announced readiness. The incumbents got there first. |
| **Supplier chemical-compliance declarations (RoHS/REACH/Prop 65/PFAS)** | Occupied at both ends: BOMcheck (Sphera), Z2Data, Certivo, Regilient — and **turnus.ai already auto-completes these questionnaires inside supplier portals**, which was exactly the gap I was probing. |
| **Nonprofit charitable-solicitation registration** | **FACT:** 40 states + DC require registration, with annual renewals tied to fiscal year-end and Form 990, fees $0–$400/state. But the service layer is thick — Harbor Compliance, Labyrinth, Ironwood, RegiSTAR-US, CharityIQ, Wylie — and the cadence is annual. |
| **Dental insurance verification** | High willingness to pay (**EVIDENCE:** Trojan at **$400–$700/mo**), but it requires payer eligibility access and touches PHI. Zuub owns the API-native position. Wrong risk profile for a solo, low-touch operation. |
| **Funeral homes / FTC Funeral Rule** | **FACT:** the Rule requires price disclosure **in person and by phone, but not on websites.** Online posting is still only a proposed amendment. There is no compliance obligation to sell against. |
| **Childcare licensing compliance** | Occupied: brightwheel, Procare, Playground, Lillio, Kangarootime, plus ChildCareComp positioned specifically on compliance. Brightwheel already does real-time ratio alerts and PD-hour tracking. |
| **Farm / USDA acreage & crop-insurance recordkeeping** | **FACT:** FSA announced an acreage-reporting modernisation pilot in June 2026. The agency is removing the pain itself — the same failure mode as the SAM.gov wage alerts. |
| **Music royalty statement reconciliation** | Occupied and cheap: Curve, Qlero, Reprtoir, eddy.app, and **LabelGrid from $99/year**. |
| **Restaurant invoice / food-cost creep** | Occupied and funded: **EVIDENCE:** MarginEdge **$350/location/month**, xtraCHEF ~$149–$349. Both already do vendor-item price-change alerts. |
| **Employee benefits billing reconciliation** | Painful and lucrative (**EVIDENCE:** 1–5% of premium spend is in error; carriers allow only 30–60 days to recover premiums for terminated employees; ~$400–$1,600 lost per terminated employee). But it is thoroughly occupied — Tabulera, Beneration/VerifiaBill, Insynctive, PlanSource, AdminaHealth, Benefitfocus, Selerix, Marsh MMA — and enrollment data is PHI under HIPAA. |
| **Owner-operator settlement auditing** | Occupied (Toro TMS, Dashdoc, Fleetive, Truckpedia) and the buyer is the carrier, not the driver. Low willingness to pay on the driver side. |

---

## The meta-finding (this matters more than any single idea)

Two patterns held across **every** vertical I probed, without exception:

**1. The obvious niches are picked over.** Every vertical-compliance and
document-reconciliation problem with visible pain already has **three to eight**
named competitors in 2026. Wave 1 found this in COI tracking, exclusion screening
and commission reconciliation. Wave 2 found the identical structure in eleven more
industries. This is not bad luck — it is what the market looks like now. Any plan
that depends on finding an *uncontested* niche is a plan that will keep failing.

**2. Document parsing itself has been commoditised.** This is the more important
half. **EVIDENCE:** Parseur offers email-forward-in bill parsing with a QuickBooks
integration **from $39/month**; Lido, DigiParser, Affinda and utilitybillocr.com
compete at similar prices; horizontal AI extraction "reads any format without
templates or model training."

**The implication for us:** *"we turn your PDFs into structured data"* is no longer
a business. It is a $39/month commodity that any competitor can bolt on. Whatever
we build, the defensible value has to sit in the **judgement layer above the
parse** — reconciliation logic, domain business rules, and an accumulated library
of counterparty-specific quirks that a horizontal tool has no reason to build.

This is a genuine argument *in favour of* the wave-1 recommendation, whose value
was always the matching and variance logic rather than the PDF reading — and a
genuine argument *against* several ideas that looked attractive before I knew it.

---

## Live candidates produced by wave 2

### W1 — Utility-rebate program data + submission assistant for contractors
**Customer:** HVAC, insulation, lighting and electrical contractors who offer
"we handle the rebate paperwork" as a sales tool.

**Problem:** **EVIDENCE:** rebate availability and submission requirements vary by
state and by utility; applications typically require a Manual J report, AHRI
certificate, itemised invoice and proof of payment, and must be filed within a
**30–45 day window** after installation. The programs change constantly and the
rules live in hundreds of separate utility PDFs.

**Competition:** Rebate Bus and Encentiv Energy exist — but **EVIDENCE:** both
serve *manufacturers, distributors, retailers and ESCOs*, not the installing
contractor. I could not identify a contractor-side incumbent. **UNKNOWN:** whether
that is a gap or a sign contractors will not pay.

**Why it is not a recommendation:** the data *is* the product, and the data is
hundreds of utility programs that change continuously — unbounded maintenance, and
we would be re-creating the thing that made the utility-tariff idea unwinnable.

### W2 — Multi-site utility & telecom bill *audit* — considered and discounted
**The pull was real.** **EVIDENCE:** an entire BPO industry exists to key these
bills by hand (ARDEM, Rely Services, Cost Control Associates) — money already
flowing to human labour, exactly the signal worth hunting. A cited ROI datapoint:
**$15,600–$19,800/year net savings on a 200-unit portfolio, payback under two
months**, against a **3–5% manual keying error rate**.

**Why discounted anyway:** the parsing half is the $39 commodity above, and the
*audit* half — validating that each site is on the correct rate schedule —
requires exactly the utility tariff database that sits behind Arcadia/Genability's
moat. We would be a thin wrapper on one commodity and locked out of the other.

### W3 — Marketplace-first: build into the field-service app ecosystem
Not a product — a **validated distribution channel**, which is the thing that
usually kills solo software businesses.

**EVIDENCE:** Jobber announced passing **100 app integrations in May 2026**;
Housecall Pro deliberately keeps a focused list of **~30 partners**; ServiceTitan
reports **more than 120 companies applied to its App Marketplace in a single
quarter**, and that **over 70% of its customer tenants have integrated a
Marketplace app.**

Read those together: ServiceTitan's catalogue is competitive and certification-
gated, but **Jobber and Housecall Pro have strikingly thin catalogues relative to
their install bases**, and their customers already pay for software monthly.

**Why it is not yet a recommendation:** I have a channel and no validated problem.
Choosing it would mean deliberately inverting the order — pick the channel, then
run a short discovery pass *inside* it to find what those contractors actually pay
people to do manually. That is defensible, and it is consistent with your own rule
that distribution must be settled before the product. But it is one extra
validation step, not a shortcut.

---

## Where this leaves the decision

Wave 2's real contribution is that it **changes the scoring of one wave-1 finalist.**

I originally rejected **Finalist 3 (municipal & local bid-results / unit-price
intelligence)** on one ground: thousands of brittle scrapers plus FOIA
correspondence means ongoing human operations, which your mandate penalises hardest.

That objection is weaker than I gave it credit for, for two reasons:

1. **Scraper maintenance is the single most agent-suited task in this entire
   document.** A broken parser is a self-announcing, self-diagnosing, self-fixing
   failure. The "ongoing human ops" I penalised is largely ongoing *agent* ops.
2. **It is the only candidate I found across 30 industries with a real moat.**
   Everything else loses its defensibility the moment a competitor points a
   commodity parser at the same documents. Aggregated local bid tabulations cannot
   be copied without redoing the collection work — and it has the strongest
   programmatic-SEO surface of anything here.

Its weakness is the mirror image: **demand at our price point is unproven**, where
Finalist 1's is proven by published competitor prices. So the choice has sharpened
into a real trade-off rather than a ranking:

| | Finalist 1 — Commission reconciliation | Finalist 3 — Bid-results data |
|---|---|---|
| Demand | **Proven** (competitors publish $67–$800/mo) | Unproven at our price |
| Moat | Weak (format library only) | **Strong** (the aggregation *is* the moat) |
| Time to revenue | Faster | Slower |
| Competitors | 7+ named | 3, all selling *opportunities* not *results* |
| Agent-operable | High | High, and it is the core loop |
| Main risk | Out-competed | Nobody pays |
