# Go-to-market plan

**Status: plan only.** Nothing here is published until approved.

---

## 1. Positioning

**Against the $400–$800 platforms:** no implementation, no demo, no annual contract.
Upload files, get a report, cancel yourself.

**Against Applied Recon and AMS-native tools:** works with *any* AMS and *every*
carrier, including the ones that never send an IVANS feed.

**Against Commission Tracker and the $67–$187 tools:** they record commissions you
already know about. We find the ones you *don't* — the policy paid at 12% instead
of 15%, and the one never paid at all.

**Against Excel:** we do the part VLOOKUP cannot — matching across reformatted
policy numbers and inconsistent insured names.

One sentence: **"Find the commission your carriers didn't pay you."**

A deliberate discipline in all copy: we say *flagged for your review*, never
*you were underpaid*. We surface discrepancies; the agency decides. This is a
positioning choice and a liability choice at the same time.

---

## 2. Pricing page copy (draft)

> ## Find the commission your carriers didn't pay you.
>
> Upload your carrier statements and your book of business. We match every line,
> flag every discrepancy, and hand you a report you can act on.
> No implementation. No demo. No contract.

| | **Free** | **Solo** | **Agency** | **Firm** |
|---|---|---|---|---|
| | $0 | **$79**/mo | **$179**/mo | **$349**/mo |
| Statement → clean CSV | 1/month | unlimited | unlimited | unlimited |
| Commission lines reconciled | — | 300/mo | 2,000/mo | 10,000/mo |
| Carriers | — | unlimited | unlimited | unlimited |
| Rate variance detection | — | ✓ | ✓ | ✓ |
| Missing-payment detection | — | ✓ | ✓ | ✓ |
| Chargeback & duplicate detection | — | — | ✓ | ✓ |
| History & month-over-month trends | — | — | ✓ | ✓ |
| Multi-client workspace (for bookkeepers) | — | — | — | ✓ |
| Support | docs | email | email | priority email |

> **Works with any agency management system.** HawkSoft, EZLynx, AMS360, Applied
> Epic, Agency Matrix, NowCerts, QQCatalyst — or a spreadsheet. If you can export a
> list of policies, you can use this.
>
> **Your data stays yours.** Statements are deleted after 90 days by default. We
> never train models on your data. Delete everything, any time, in one click.
>
> **Cancel yourself, any time.** No call required.

FAQ to answer on the page, because each is a real objection: *Do you need access to
my AMS?* (No.) *Which carriers do you support?* (Any — unknown formats are learned
on first upload.) *Is my client data safe?* (§6 of the spec.) *What if the numbers
are wrong?* (Everything is flagged for review; nothing is filed or sent for you.)
*Why is month one less useful?* (Rate variance needs a baseline — say so honestly.)

---

## 3. Customer acquisition

### 3a. The free tool is the front door
`/tools/commission-statement-converter` — upload a statement, get clean columns,
email to download. It ranks for a real query, does real work, and instruments K3.

Supporting free tools, each its own landing page and each genuinely useful:
- commission split calculator
- policy-number normaliser (bulk clean a messy export)
- book-of-business deduplicator

### 3b. Programmatic SEO
Four templates. Every page must be genuinely useful standing alone — thin
doorway pages get devalued and would waste the whole channel.

| Template | Route | Volume | Content |
|---|---|---|---|
| Carrier | `/carriers/[carrier]` | ~150 | statement format, how it is delivered, the fields it uses, the reconciliation quirks, converter CTA |
| AMS | `/ams/[ams]` | ~12 | exactly how to export a book of business from that system, screenshot-level |
| Comparison | `/vs/[competitor]` | ~8 | honest side-by-side, including where they are the better choice |
| Guide | `/guides/[topic]` | ~20 | the pillar content |

**First 25 pages to publish, in order:**

1. Commission statement converter (the tool itself)
2. How to reconcile insurance commission statements: a practical guide
3. Why VLOOKUP breaks on commission reconciliation
4. How to export your book of business from HawkSoft
5. …from EZLynx
6. …from AMS360
7. …from Applied Epic
8. …from Agency Matrix
9. …from NowCerts
10. What is IVANS, and why doesn't it cover all my carriers?
11. Commission reconciliation checklist (downloadable)
12. How to spot an underpaid commission
13. Chargebacks: how to reconcile them properly
14–25. Carrier pages for the highest-volume names — Travelers, Progressive,
Nationwide, Safeco, The Hartford, Liberty Mutual, Erie, Auto-Owners, Chubb,
Foremost, Grange, Encompass

Then continue the carrier long tail indefinitely — this is the compounding channel,
and it is fully agent-operable.

### 3c. The bookkeeper channel (highest leverage per unit of effort)
Firms that specialise in insurance-agency bookkeeping each serve 5–20 agencies. One
relationship, many accounts. The **Firm** tier and its multi-client workspace exist
specifically for them. Reached through the same SEO surface plus targeted, low-touch
outreach — a useful tool, not a pitch.

### 3d. Communities
Agency-owner groups on Facebook and LinkedIn, and independent-agent forums.
**Participation rule: publish the free tool and answer questions. Never post a
pitch.** Getting this wrong burns the channel permanently and the owner never gets
to un-burn it.

### Explicitly not doing
Cold calls. Demos. Conference booths. Paid ads before organic conversion is proven.

---

## 4. Launch sequence and owner approval gates

| Stage | Work | Needs you | Cost |
|---|---|---|---|
| **0** | Build free tool + landing page. Accuracy-test against public sample statements and synthetic fixtures. | **Nothing** | $0 |
| **1** | Check domain availability, register, deploy | domain purchase | ~$15/yr |
| **2** | Publish first 25 SEO pages; seed the free tool in communities | — | $0 |
| **3** | Measure K1 and **K3** on real uploads. **Go/no-go decision point.** | read the report | ~$20–50 LLM |
| **4** | Stand up Stripe, open founding-member pricing, charge before the engine ships | Stripe account, pricing approval | % of revenue |
| **5** | Build the reconciliation engine for customers who already paid | — | hosting ~$20–40/mo |
| **6** | Automate operations (§5) | ToS/Privacy/DPA sign-off | — |

**Total owner spend before the first honest go/no-go: under $100.**

Stage 3 is a real gate, not a formality. If K1 or K3 fires there, we stop, and the
alternatives in `05-WAVE-2-RESEARCH.md` are still on the shelf.

---

## 5. The operating model — which agent does what

| Agent | Owns | Escalates to you when |
|---|---|---|
| **Engineering** | features, tests, deploys, dependency updates | architecture change; anything touching payments |
| **Parser** | new carrier profiles from failed uploads; regression suite | accuracy drops below the K4 floor |
| **Support** | docs, FAQ, tier-1 email replies | a customer disputes a dollar figure; an angry customer |
| **Growth** | SEO pages, carrier long tail, comparison content, experiments | any paid spend; any claim about a named competitor |
| **Analytics** | funnel, activation, retention, churn signals | a kill criterion crosses threshold |
| **Billing** | subscriptions, receipts, dunning, failed cards | refund > $200; any pricing change |
| **Monitoring** | Sentry triage, uptime, cost-per-tenant | security incident; margin breach (K7) |
| **Competitor watch** | pricing and feature changes at the 7 named rivals | a rival ships a self-serve tier ≤ $129 (**K6**) |

### The monthly owner report
Revenue · MRR · new customers · churn · profit and expenses · traffic and
conversion · activation rate · **K3 format-tail percentage** · LLM cost per tenant ·
product errors · support volume · notable customer feedback · running experiments ·
**anything requiring a human decision.**

When nothing needs you, the report says exactly one thing:

> **NO ACTION REQUIRED.**

---

## 6. What I am *not* claiming

- I have **not** validated that agencies will upload statements to an unknown tool.
  That is K1 and it is unproven.
- I have **not** measured the carrier format tail. That is K3, the largest risk in
  the plan, and it is unmeasurable from a desk.
- The pricing table is a **HYPOTHESIS**. The founding-member charge in Stage 4 is
  the first real test of it.
- Competitor prices are **EVIDENCE** from search summaries, not from pricing pages I
  was able to open — this environment's egress is blocked. Worth a five-minute
  re-check from an unrestricted machine before the comparison pages go live.
