# Autonomous digital-product business — discovery, validation, and build

This repository is the working record and codebase for a digital-product business
intended to reach **$1,000/month, then $5,000/month**, with recurring revenue and
minimal owner involvement.

The owner's role is **owner, not operator**: observe, approve, decide.

## Where things stand

**Phase: opportunity selected. Plan complete, awaiting approval to build.**

**Selected:** carrier commission-statement reconciliation for small & mid independent
insurance agencies (Finalist 1), chosen after two research waves covering ~30
industries and 25 rejected opportunities.

| Doc | What it is |
|---|---|
| [`business/01-METHOD-AND-CONSTRAINTS.md`](business/01-METHOD-AND-CONSTRAINTS.md) | How the research was done, how evidence is labelled, and the network limits of this environment |
| [`business/02-REJECTED.md`](business/02-REJECTED.md) | 11 opportunities investigated and killed, with the reason each died |
| [`business/03-FINALISTS.md`](business/03-FINALISTS.md) | The 4 finalists, in full |
| [`business/04-THESIS-AND-PLAN.md`](business/04-THESIS-AND-PLAN.md) | Scoring, investment thesis, kill criteria, validation plan, permissions model |
| [`business/05-WAVE-2-RESEARCH.md`](business/05-WAVE-2-RESEARCH.md) | Second research wave: 14 more opportunities killed, plus the two meta-findings that shaped the final plan |
| [`business/06-PRODUCT-SPEC.md`](business/06-PRODUCT-SPEC.md) | Architecture, data model, parsing strategy, the matching cascade, security, scope discipline |
| [`business/07-GO-TO-MARKET.md`](business/07-GO-TO-MARKET.md) | Positioning, pricing page copy, SEO plan, launch gates, agent operating model |

## The business

**Find the commission your carriers didn't pay you.**

Small independent insurance agencies receive commission statements from 10-40
carriers every month, in mutually incompatible formats, and must match every line
against their own book to find policies paid at the wrong rate or not paid at all.
Underpayment is silent: an agency that does not reconcile never learns it was
shorted.

- **Monthly, permanent, externally triggered** - the carriers cause it, not our
  customer's discipline
- **Willingness to pay is already published**: $67-$187/mo for commission trackers,
  $400-$800/mo for reconciliation platforms
- **The $180-$400 self-serve band is empty**, and every serious competitor is
  coupled to a specific AMS or to an IVANS feed
- **$5,000/month needs under 30 customers**
- Cost to reach the first honest go/no-go signal: **under $100**

## Next gate

Stage 0 (free tool + landing page + accuracy testing) needs nothing from the owner
and costs nothing. Everything after it is gated in
[`07-GO-TO-MARKET.md` §4](business/07-GO-TO-MARKET.md).

## Evidence discipline

Every claim in these documents is labelled **FACT**, **EVIDENCE**, **ASSUMPTION**,
**HYPOTHESIS**, or **UNKNOWN**. Nothing is invented. Where a number could not be
verified — including the commonly-quoted count of US independent insurance
agencies — it is marked UNKNOWN rather than guessed.
