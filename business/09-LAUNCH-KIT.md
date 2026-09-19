# Launch kit — the owner time that unblocks everything

The tool is built, deployed and running at
**https://statement-sweep.vercel.app**. Two things need you. The first takes
about 30 seconds, the second about 20 minutes.

---

## 0. First: make the site reachable (~30 seconds) — BLOCKING

The deployment is live but **currently only you can open it.** The Vercel team has
Vercel Authentication (`ssoProtection`) switched on for all non-custom domains, so
every `.vercel.app` URL demands a Vercel login. I created the project and deployed
it, but the connector token is not authorised to change project settings in that
scope, so I cannot turn this off.

> Vercel dashboard → **statement-sweep** → Settings → **Deployment Protection** →
> set **Vercel Authentication** to Disabled → Save.

Scoped to this one project. Does not affect rentalos, freight-os or anything else.
Reversible from the same screen.

This is a deliberate exception to your team's default protection posture, which is
why I am asking rather than assuming — but note the project contains no secrets and
no database, and being publicly readable is the entire point of a marketing site.

**Nothing below works until this is done.**

---

## 1. Then: first contact (~20 minutes)

**The one thing I cannot do is make first contact with a human**, because that needs
an account and a real person behind it. This is the whole ask, and it is copy-paste.

---

## Why this specific ask

We need roughly **25–30 real carrier statements** to answer kill criterion K3 — how
long the carrier format tail actually is. That single number decides whether this
business works. Nothing else we can do from a desk will answer it.

Synthetic fixtures cannot answer it. My own test files scored 100%, which proves
only that I have no bugs against cases I thought of.

---

## Option A — insurance-agency bookkeepers (highest leverage, do this first)

Firms that keep the books for independent insurance agencies each serve 5–20
agencies, and they are the ones actually doing the reconciliation by hand. One
reply can be a dozen statements.

**Send from:** a fresh Gmail — `statementsweep@gmail.com` or similar. Deliberately
not a custom-domain address: a brand-new domain has no sending reputation, so
cold-ish B2B mail from one lands in spam far more often than mail from an
established provider. At this volume Gmail is the better choice on the merits, not
just the cheaper one.

Set the display name to a real person's name rather than the product's, forward it
to an inbox that actually gets read, and send them one at a time by hand. Fifteen
manual sends from a fresh Gmail is ordinary behaviour; fifteen through a bulk tool
from a fresh Gmail is a spam signal.

**Find them:** search `"insurance agency bookkeeping" services` or
`bookkeeping for insurance agencies`. There are specialist firms that do only this.
Aim for **10–15 emails**, no more. This is targeted low-touch outbound, not a
campaign.

**Send this:**

> **Subject:** Free tool for carrier commission statements — would this save you time?
>
> Hi — I built a free tool that converts carrier commission statements into clean,
> columnar data. Policy numbers and insured names get normalised so they actually
> line up against a book of business, chargebacks keep their sign, and it tells you
> when the line items don't sum to the total printed on the statement.
>
> It's free, there's no account, and nothing is stored — the file is read and
> discarded. I'm not selling anything yet.
>
> https://statement-sweep.vercel.app
>
> What I'd genuinely value: if you try it on a real statement and it fails, I'd like
> to know which carrier. I'm trying to find out how much format variety is actually
> out there, and I can only learn that from real files.
>
> If it's useful, keep using it.

**Do not** follow up more than once. If nobody replies, that is data too.

## Option B — agency owner communities

Facebook groups for independent insurance agency owners, LinkedIn, or
insurance-forums.com.

**Rules that matter more than the copy:** read each group's self-promotion policy
first, post the *tool*, never a pitch, and answer questions if they come. Getting
this wrong burns a channel permanently and neither of us gets to un-burn it.

> Built a free thing that might be useful here. It converts a carrier commission
> statement into clean columns — normalises policy numbers and insured names so they
> match your book, keeps chargebacks negative, and flags it when the lines don't add
> up to the statement total.
>
> Free, no signup, nothing stored. https://statement-sweep.vercel.app
>
> If it chokes on one of your carriers I'd like to know which — I'm trying to work
> out how much format variety is really out there.

---

## What I do with what comes back

I read the upload logs. Every upload records the *shape* of the file only — never
its contents. From that I can tell you:

- **the K3 number**: what share of uploads brought a layout we had never seen
- the format mix (how much of this is PDF, which we currently refuse)
- which carriers people actually bring
- how many uploads succeeded

If PDFs dominate, that is an early signal against the deterministic-parsing margin
thesis, and better to know in week one than month six.

---

## Decisions waiting on you (none urgent)

0. **Deployment protection** — see section 0 above. This one *is* urgent, in the
   sense that nothing works without it.
1. **Hosting plan.** This is on Vercel's **Hobby** tier — genuinely $0, but Hobby is
   for non-commercial use. Before this ever takes money it has to move to Pro
   (~$20/mo). Fine to leave until there is revenue to justify it.
2. **A domain**, once we know it is worth one. `noindex` comes off the same day.
3. **A trademark search on "Statement Sweep"** before we put weight behind the name.

---

## What I am not asking for

No Stripe. No entity. No spending. No demos, no calls, no posting on a schedule.
If this fails K1 or K3, it fails having cost about twenty minutes and nothing else.
