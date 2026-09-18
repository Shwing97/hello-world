# Investment thesis, scoring, kill criteria, and validation plan

## Scoring (1–5, 5 = best). Weighted criteria marked ★

| # | Criterion | F1 Commission recon | F2 Exclusion feed | F3 Bid results | F4 Packaging EPR |
|---|---|:--:|:--:|:--:|:--:|
| 1 | Pain severity | 4 | 3 | 4 | 4 |
| 2 | Frequency of problem | **5** (monthly) | 5 | 4 | 2 (annual) |
| 3 | Existing spending | **5** | 4 | 4 | 3 |
| 4 | Willingness to pay | **5** | 3 | 4 | 3 |
| 5 | ★ Evidence of demand | **5** | 2 | 4 | 3 |
| 6 | Competition (5 = least) | 2 | 4 | 3 | 3 |
| 7 | Weakness of competitors | 4 | 3 | 3 | 3 |
| 8 | Ease of development | 3 | 4 | 2 | 3 |
| 9 | Time to MVP | 4 | 4 | 2 | 3 |
| 10 | Startup cost | **5** | 5 | 3 | 4 |
| 11 | Operating cost | 4 | 4 | 2 | 4 |
| 12 | Gross margin | **5** | 5 | 3 | 4 |
| 13 | ★ Recurring revenue | **5** | 5 | 5 | 2 |
| 14 | Customer retention | 4 | 5 | 4 | 2 |
| 15 | Support burden (5 = least) | 3 | 5 | 3 | 3 |
| 16 | ★ Automated acquisition | **5** | 1 | 5 | 3 |
| 17 | Automated onboarding | **5** | 3 | 5 | 3 |
| 18 | Automated fulfilment | 4 | 5 | 3 | 3 |
| 19 | Automated support | 4 | 5 | 4 | 3 |
| 20 | ★ Low owner involvement | **5** | 2 | 3 | 3 |
| 21 | ★ Reach $1,000/mo | **5** | 4 | 4 | 3 |
| 22 | ★ Reach $5,000/mo | 4 | 4 | 3 | 3 |
| 23 | Scale beyond $5,000/mo | 4 | 3 | 4 | 3 |
| 24 | Defensibility | 4 (parser library) | 4 | 4 | 2 |
| 25 | AI agents can operate it | **5** | 4 | 3 | 3 |
| | **Weighted outcome** | **WINNER** | niche/high-touch | ops-heavy | wrong cadence |

F1 loses on exactly one axis — **competition** — and wins or ties on every axis the owner mandate weights most heavily.

---

## Investment thesis

**Why this customer.** Independent insurance agencies already buy software, at known prices, without being sold to: **EVIDENCE** puts their core AMS at $250–$350/mo (HawkSoft, EZLynx). They are numerous, geographically dispersed, and reachable only through search — which suits an owner with no audience and no willingness to sell. They are also *businesses whose entire revenue arrives as commission*, so a tool that finds unpaid commission pays for itself in a way the buyer can verify in one month.

**Why this problem.** It recurs **monthly, permanently**, it is triggered by an external party (the carrier) rather than by our customer's discipline, and failing to do it loses money silently. The hard part is not the comparison, it is the **normalisation** of 20–40 mutually incompatible formats — which is precisely the class of work that has become cheap for us and stayed expensive for everyone else.

**Why people will pay.** They already do, at published prices: **$67–$187/mo** for commission *trackers*, **$400–$800/mo** for full reconciliation platforms. We are not asking a market to start spending; we are asking it to spend differently.

**Why current solutions leave room.** Every serious option is coupled — to Applied Epic, or to an IVANS feed, or to a weeks-long implementation. The affordable options do bookkeeping, not parsing. **Nobody is selling self-serve statement normalisation + variance detection, AMS-agnostic, in the $180–$400 band.** That decoupling is both the product gap and the reason the business can run without a salesperson.

**Why acquisition is feasible.** The free "commission statement PDF → Excel" utility is a real tool people search for, it needs no audience, and it hands us the exact asset the paid product is built from — a library of real carrier formats. On top of it sits a large programmatic-SEO surface (per carrier, per AMS, per competitor), plus a channel (insurance-agency bookkeeping firms) that multiplies each relationship.

**Why the economics work.** Near-zero marginal cost. **Under 30 paying customers reaches $5,000/mo.** Infrastructure and LLM inference at that volume is tens of dollars per month, not thousands.

**Why it can run without the owner.** Discover → understand → sign up → pay → self-onboard, with no human in the loop. The one recurring operational task — supporting a new carrier statement format — is itself automatable: an agent reads the failed sample and ships a parser.

**What still needs validating.** (1) Will small agencies upload a real commission statement to an unknown tool? (2) How long is the carrier-format tail per customer? (3) Will they pay $179 without a demo? (4) Is the SEO surface actually reachable? None of these are knowable from a desk. All are cheap to test.

---

## Kill criteria — decided in advance, not negotiable after the fact

We abandon F1 and move to F2/F3 if **any** of these is hit.

| # | Criterion | Threshold | By when |
|---|---|---|---|
| K1 | **No upload behaviour.** Visitors will not hand a real statement to an unknown tool. | < 10% of landing-page visitors upload a real statement | 300 visitors |
| K2 | **No payment intent.** Compliments but no money. | < 3 paid founding signups (or pre-orders) | 60 days from launch of the paid tier |
| K3 | **Format tail is unbounded.** Support cost never amortises. | after 25 agencies' statements, **> 40%** of newly uploaded statements still need a new parser | 25 agencies |
| K4 | **Accuracy floor not reachable.** | matching accuracy < 95% on held-out real statements | before charging anyone |
| K5 | **Distribution is closed.** | zero page-1 rankings on any target long-tail query | 6 months of published content |
| K6 | **Incumbent closes the wedge.** | a named competitor ships a self-serve, AMS-agnostic tier at ≤ $129/mo with equivalent parsing | any time |
| K7 | **Margin breaks.** | per-customer inference + infra cost > 25% of that customer's MRR | any time |
| K8 | **Support burden.** | > 30 min of human-escalated support per customer per month at 15+ customers | 15 customers |

K3 is the one I most expect to fire. It must be instrumented from the first upload.

---

## Validation plan — behaviour over opinions, money over compliments

Sequenced so that **no meaningful build happens before evidence**, and so the expensive risk (K3) is measured first.

### Stage 0 — Zero spend, no accounts needed *(can start immediately)*
Build the free utility and the landing page as static/serverless. Accuracy-test the parser against **publicly available sample commission statements** and synthetic fixtures. Deliverable: a working "statement → clean CSV" tool and a landing page with pricing and a waitlist. **Owner input required: none.**

### Stage 1 — Put it in front of real users *(needs: domain + hosting)*
Publish. Seed 15–25 SEO pages. Post the *free tool* (not a pitch) where agency owners already are. Instrument every upload: file format, carrier, parse success/failure, whether a new parser was needed.
**Measures K1 and — critically — K3, before we have written the reconciliation engine.**

### Stage 2 — Charge before it is finished *(needs: Stripe)*
Once the free tool has real uploads, add a **founding-member price** for the reconciliation engine: paid up front, delivered in 30 days, full refund if we miss. This is the only honest test of K2. Compliments are not data; a charge on a card is.

### Stage 3 — Build the reconciliation engine
Only for customers who have already paid. Matching engine, variance detection, monthly cadence, history.

### Stage 4 — Automate the company
Lifecycle email, dunning, churn detection, docs, tier-1 support agent, SEO content pipeline, competitor monitoring, and the monthly owner report.

### Estimated cost to reach the first real go/no-go signal
| Item | Cost |
|---|---|
| Domain | ~$15/yr |
| Hosting (serverless, free tier initially) | $0–$20/mo |
| LLM inference during validation | ~$20–$50 |
| Stripe | % of revenue only |
| **Total before go/no-go** | **under $100** |

That is the entire downside of testing this.

---

## Permissions model proposed

**Agents act autonomously:** code, tests, deploys, error handling, docs, SEO content, lifecycle email, tier-1 support replies, analytics, competitor monitoring, A/B experiments, dependency updates, routine refunds under $200.

**Owner approval required:** any new recurring spend; any paid advertising; pricing changes; legal documents (ToS, privacy policy, DPA); anything touching banking or identity; destructive data operations; refunds over $200; security incidents; anything irreversible or outward-facing under the company's name.
