# Handoff prompt

Paste everything below the line into a fresh session. It is written to stand alone —
a new session starts cold and may be in a different environment.

---

You are taking over an autonomous digital-product business. Everything is in the
GitHub repo Shwing97/hello-world, branch claude/autonomous-product-discovery-vbhf8y.

READ FIRST, IN ORDER:
  business/01-METHOD-AND-CONSTRAINTS.md  - evidence labelling + environment limits
  business/03-FINALISTS.md               - the opportunity and why it was chosen
  business/05-WAVE-2-RESEARCH.md         - two meta-findings that shape everything
  business/06-PRODUCT-SPEC.md            - architecture and the matching design
  business/07-GO-TO-MARKET.md            - positioning, pricing, launch gates
  business/08-STAGE-0-STATUS.md          - what is built and verified
  business/09-LAUNCH-KIT.md              - the outreach plan and owner asks

THE BUSINESS
Statement Sweep. Small independent insurance agencies get commission statements
from 10-40 carriers monthly in incompatible formats and must match every line
against their book to find policies paid at the wrong rate or not paid at all.
Underpayment is silent. Competitors publish $67-$800/mo, the $180-$400 self-serve
band is empty, and every serious rival is coupled to a specific AMS or to an IVANS
feed. $5,000/mo needs under 30 customers. Owner wants to be owner, not operator.

STATE
- Live and PUBLIC at https://statement-sweep.vercel.app (Vercel Hobby, $0,
  project statement-sweep, prj_S2gsvYFgIZYuP3a5mxiTN1zTmwGF, team
  team_NJnXFdkwWtGR5mVmpxZcYHct). Protection is confirmed off.
- Next.js app: free "commission statement -> clean CSV" converter, landing page,
  privacy, terms, two guides. 42 tests pass, typecheck and build clean.
- noindex + robots disallow while on the temporary subdomain; one env var
  (SITE_INDEXABLE=true) flips it when a real domain lands.
- Gmail connector is authenticated as statementsweep@gmail.com (verified, NOT the
  owner's personal address). One deliverability test email has been sent to
  shwing97@gmail.com. Awaiting: inbox-or-spam result, whether the link loads in a
  private window, the owner's first name for signatures, and a recipient list.

TWO NON-NEGOTIABLE DESIGN RULES
1. Money is integer cents only, never floats. A drifting cent is a wrong number
   shown to a customer, and a wrong number sent to a carrier ends the business.
2. Refuse rather than guess. Three paths already return ok:false - unresolvable
   layout, line items not summing to the printed statement total, and PDFs. Never
   weaken these to make output look better.

WHY THE ARCHITECTURE IS WHAT IT IS
Document parsing is now a ~$39/mo commodity (Parseur, Lido, DigiParser). So
parsing is treated as disposable plumbing: a three-tier strategy keeps most volume
on deterministic stored column maps with ZERO LLM calls, which is what holds the
margin kill criterion open. The defensible asset is (a) the matching cascade and
(b) the carrier profile library, which is global rather than per-tenant and stores
STRUCTURE ONLY - a guard in lib/profiles.ts refuses to persist a profile whose
"headers" look like data. Do not break that guard.

THE NUMBER THAT DECIDES EVERYTHING
K3, the carrier format tail: what share of uploads bring a layout never seen
before. Kill criterion fires if, after 25 agencies, >40% of uploads still need a
new profile. Telemetry is already recorded on every upload as single-line JSON
prefixed K3_UPLOAD in Vercel runtime logs - file shape only, never contents, never
the filename. All eight kill criteria are in business/04-THESIS-AND-PLAN.md and
were committed to in advance. Honour them.

BEWARE ONE NUMBER
The K4 accuracy harness reports 100% (72/72 fields). That is against fixtures
written by the previous session. It is a regression baseline, NOT evidence of
real-world accuracy. Do not quote it to anyone as proof the parser works. It
becomes meaningful only when real carrier statements are labelled into
tests/accuracy.test.ts.

ENVIRONMENT (check whether yours differs)
In the previous session the egress proxy rejected the CONNECT for every host -
curl, WebFetch and Playwright-driven Chromium all failed, example.com included.
Only WebSearch worked. That is why there is no recipient list: firm names are
findable but contact pages are not reachable. If YOUR session has working egress,
the single highest-value thing you can do is visit these and collect contact
addresses: insuranceagencyaccountants.com (info@insuranceagencyaccountants.com is
already known), bookkeepingforbrokers.com, advancedprofessional.net, cocountant.com,
insurancebackofficepro.com. Avoid ZoomInfo/LeadIQ-style brokers - those addresses
are often guessed patterns and bounces from a new mailbox get it flagged.

SENDING DISCIPLINE
statementsweep@gmail.com is days old with no sending reputation. Send 3-5 per day
over several days, genuinely personalised, never a burst of identical messages.
If they all land in spam we learn nothing and would wrongly conclude the market
does not want this. Keep the opt-out line. CAN-SPAM also wants a physical postal
address - the owner has not supplied one; raise it, do not silently skip it.

OWNER PERMISSIONS
Act autonomously on: code, tests, deploys, content, docs, routine support.
Require owner approval for: any spending, pricing changes, legal documents,
banking or identity, destructive data operations, refunds over $200.
Hosting is Vercel Hobby, which is non-commercial - it must move to Pro (~$20/mo)
before the business takes any money. Flag this before any payment work.

HOUSE STYLE
Label every claim FACT / EVIDENCE / ASSUMPTION / HYPOTHESIS / UNKNOWN. Never
invent market sizes, search volumes or competitor revenue. Where something could
not be verified - including the commonly quoted count of US independent agencies -
it is marked UNKNOWN, and it stays that way until someone verifies it.
