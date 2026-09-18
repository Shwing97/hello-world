import type { Metadata } from "next";
import Converter from "./Converter";

export const metadata: Metadata = {
  title: "Commission statement converter — CSV or Excel to clean columns",
  description:
    "Upload an insurance carrier commission statement and get clean, normalised columns you can reconcile against your book of business. Free, no account.",
};

export default function Page() {
  return (
    <main>
      <section>
        <div className="wrap">
          <h1>Commission statement converter</h1>
          <p className="lede">
            Upload a carrier commission statement. Get back clean columns, with policy numbers and
            insured names normalised so they line up against your book &mdash; plus anything that
            looks wrong.
          </p>
          <Converter />
        </div>
      </section>

      <section>
        <div className="wrap narrow">
          <h2>What it does to your file</h2>
          <ul className="plain">
            <li>
              <strong>Finds the real header row.</strong> Statements rarely start with their
              headers. Four rows of carrier letterhead and a statement period come first, and
              assuming row one is the header is how a parser silently produces garbage.
            </li>
            <li>
              <strong>Normalises policy numbers.</strong> <code>POL-0001234</code> and{" "}
              <code>pol 000 1234</code> become the same key, so they match your book.
            </li>
            <li>
              <strong>Normalises insured names.</strong> <code>Smith &amp; Sons, LLC</code> and{" "}
              <code>SONS AND SMITH INC</code> resolve to the same name.
            </li>
            <li>
              <strong>Keeps chargebacks negative.</strong> Both <code>(150.00)</code> and{" "}
              <code>150.00-</code> are read as &minus;$150.00, so reversals net out instead of
              inflating your total.
            </li>
            <li>
              <strong>Works out the date convention.</strong> <code>03/06/2026</code> is ambiguous
              on its own. If any other row in the column has a day above 12, that settles it for the
              whole column. If nothing settles it, the guess is flagged rather than hidden.
            </li>
            <li>
              <strong>Checks the arithmetic.</strong> If line items don&rsquo;t add up to the total
              printed on the statement, you are told not to trust the conversion. A wrong number is
              worse than no number.
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
