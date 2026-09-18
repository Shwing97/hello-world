import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "What your book of business export needs to contain",
  description:
    "The fields required to reconcile a carrier commission statement against your book, and why each one matters.",
};

export default function Page() {
  return (
    <main>
      <section>
        <div className="wrap narrow">
          <h1>What your book export needs to contain</h1>
          <p className="lede">
            To reconcile a commission statement against your book, the export has to carry enough to
            identify a policy when the policy number alone fails. That is four fields, and a fifth
            if you split commission with producers.
          </p>

          <h2>Required</h2>
          <ul className="plain">
            <li>
              <strong>Policy number.</strong> The primary key, and the one that fails most often.
              Export it exactly as your system stores it &mdash; do not clean it up first. The raw
              form is more useful than a tidied one, because normalising is reversible and guessing
              is not.
            </li>
            <li>
              <strong>Insured name.</strong> The fallback when the policy number has been
              reformatted on one side. Worth exporting even though it is messy.
            </li>
            <li>
              <strong>Carrier.</strong> Without it, a policy number from one carrier can collide
              with an unrelated one from another. Short numbering schemes collide more than people
              expect.
            </li>
            <li>
              <strong>Effective date.</strong> This is what separates a renewal from the expiring
              term it replaced. Two rows can share a policy number and an insured and differ only
              here.
            </li>
          </ul>

          <h2>Strongly recommended</h2>
          <ul className="plain">
            <li>
              <strong>Premium.</strong> Needed to check whether commission was paid at the rate you
              expect. Without it you can tell that a policy was paid, but not whether it was paid
              correctly &mdash; which is most of the value.
            </li>
            <li>
              <strong>Producer code.</strong> Only if you split commission. Skip it otherwise.
            </li>
            <li>
              <strong>Line of business.</strong> Commission rates usually vary by line, so this
              makes rate checking far more accurate.
            </li>
          </ul>

          <h2>Format</h2>
          <p>
            CSV or Excel. One row per policy term. Headings in plain language &mdash; they do not
            need to match anything in particular, because column names get matched automatically
            against the many ways carriers and systems word them.
          </p>

          <h2>A note on what you should <em>not</em> include</h2>
          <p>
            Nothing else. Not dates of birth, not driver&rsquo;s licence numbers, not any part of a
            social security number, not bank details. None of it helps a reconciliation, and every
            field you include is a field you are handing to a third party. If your system exports
            them by default, delete those columns first.
          </p>
          <p className="note">
            Our converter refuses to read anything SSN-shaped for the same reason &mdash; it should
            not be in a commission statement, and if it appears, we do not want it.
          </p>

          <p style={{ marginTop: 26 }}>
            <Link className="btn" href="/tools/commission-statement-converter">
              Convert a statement &mdash; free
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
