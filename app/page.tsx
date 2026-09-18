import Link from "next/link";

export default function Home() {
  return (
    <main>
      <section>
        <div className="wrap">
          <span className="tag">Free tool</span>
          <h1 style={{ marginTop: 12 }}>Find the commission your carriers didn&rsquo;t pay you.</h1>
          <p className="lede">
            Every month your carriers send commission statements in a dozen different formats.
            Somewhere in them are policies paid at the wrong rate, and policies not paid at all.
            Underpayment is silent &mdash; if you don&rsquo;t reconcile, you never find out.
          </p>
          <p style={{ marginTop: 22 }}>
            <Link className="btn" href="/tools/commission-statement-converter">
              Convert a statement &mdash; free
            </Link>
          </p>
          <p className="note">No account. No card. Nothing installed.</p>
        </div>
      </section>

      <section id="how">
        <div className="wrap">
          <h2>Start with the part that wastes the most time</h2>
          <p className="lede" style={{ marginBottom: 26 }}>
            The slow part of reconciliation isn&rsquo;t the comparison. It&rsquo;s getting twenty
            incompatible statements into one shape before you can compare anything.
          </p>
          <div className="grid cols-3">
            <div className="card">
              <h3>Upload any format</h3>
              <p className="note">
                CSV or Excel, from any carrier. Header buried under four rows of letterhead is
                normal and handled.
              </p>
            </div>
            <div className="card">
              <h3>Get clean columns</h3>
              <p className="note">
                Policy numbers and insured names normalised so they actually line up against your
                book. Chargebacks keep their sign.
              </p>
            </div>
            <div className="card">
              <h3>See what looks wrong</h3>
              <p className="note">
                Line items that don&rsquo;t sum to the printed total, rates that don&rsquo;t match
                the premium, duplicated rows.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap narrow">
          <h2>Built for how small agencies actually work</h2>
          <ul className="plain">
            <li>
              <strong>Works with any agency management system.</strong> HawkSoft, EZLynx, AMS360,
              Applied Epic, Agency Matrix, NowCerts &mdash; or a spreadsheet. If you can export a
              list of policies, you can use this.
            </li>
            <li>
              <strong>Every carrier, not just the ones on a data feed.</strong> Reconciliation
              built into an AMS generally only covers carriers that send an electronic feed. The
              ones that email you a spreadsheet are exactly the ones worth checking.
            </li>
            <li>
              <strong>Nothing is filed or sent for you.</strong> Discrepancies are flagged for your
              review. You decide what to raise with a carrier.
            </li>
            <li>
              <strong>Your data stays yours.</strong> Uploads are processed and discarded. We never
              train models on your data.
            </li>
          </ul>
        </div>
      </section>

      <section id="pricing">
        <div className="wrap narrow">
          <h2>Pricing</h2>
          <p className="lede">
            The converter is free and stays free. Monthly reconciliation &mdash; matching statements
            against your whole book and flagging what&rsquo;s missing &mdash; is in development.
          </p>
          <div className="card" style={{ marginTop: 18 }}>
            <h3>Planned</h3>
            <ul className="plain">
              <li><strong>Free</strong> &mdash; statement converter, unlimited use</li>
              <li><strong>Solo &middot; $79/mo</strong> &mdash; up to 300 reconciled lines a month</li>
              <li><strong>Agency &middot; $179/mo</strong> &mdash; up to 2,000 lines, variance and missing-payment detection</li>
              <li><strong>Firm &middot; $349/mo</strong> &mdash; multi-client workspace for bookkeepers</li>
            </ul>
            <p className="note" style={{ marginTop: 14, marginBottom: 0 }}>
              These prices are provisional and will be tested before anything is charged.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
