import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Why VLOOKUP breaks on commission reconciliation",
  description:
    "The four specific ways a spreadsheet match fails when reconciling insurance carrier commission statements against a book of business.",
};

export default function Page() {
  return (
    <main>
      <section>
        <div className="wrap narrow">
          <h1>Why VLOOKUP breaks on commission reconciliation</h1>
          <p className="lede">
            Almost every small agency reconciles in Excel: export the book, open the statement,
            VLOOKUP on policy number. It works until it quietly doesn&rsquo;t. Here is exactly where
            it fails, and what a match has to do instead.
          </p>

          <h2>1. Policy numbers are not stable identifiers</h2>
          <p>
            This is the big one. The same policy can appear as <code>POL-0001234</code> on the
            statement and <code>POL0001234</code> in your book, because a carrier reformats, or
            because whoever keyed it in did it differently. VLOOKUP does an exact string match, so
            these are two different policies as far as the formula is concerned.
          </p>
          <p>
            A real match has to normalise both sides first: strip punctuation and spacing, uppercase
            everything, and drop leading zeros &mdash; but <em>only</em> leading zeros at the front
            of the whole string, because interior zeros usually carry meaning in a carrier&rsquo;s
            numbering scheme.
          </p>
          <p>
            The failure mode is what makes this dangerous. It does not throw an error. It returns{" "}
            <code>#N/A</code>, which looks exactly like &ldquo;this policy wasn&rsquo;t paid&rdquo;
            &mdash; and if you have a hundred of them, you stop reading them.
          </p>

          <h2>2. Insured names disagree in ways a formula can&rsquo;t reconcile</h2>
          <p>
            When the policy number fails you fall back to the name, and the name is worse.{" "}
            <code>Smith &amp; Sons, LLC</code> and <code>SONS AND SMITH INC</code> are the same
            client. So are <code>Riverbend Dental, P.C.</code> and <code>Riverbend Dental PC</code>.
          </p>
          <p>
            Matching those requires normalising the ampersand, stripping punctuation, removing
            entity suffixes, and comparing the remaining words <em>regardless of order</em>. And the
            dotted abbreviation is a genuine trap: strip the punctuation first and{" "}
            <code>P.C.</code> becomes two stray letters, <code>P</code> and <code>C</code>, which no
            longer look like an entity suffix at all.
          </p>

          <h2>3. Chargebacks have two conventions, and one of them inverts your total</h2>
          <p>
            A reversal might be printed as <code>(150.00)</code> in the accounting convention, or as{" "}
            <code>150.00-</code> with a trailing sign. Excel often reads the first as text and the
            second as text too &mdash; so they either break your SUM or, worse, get coerced to a
            positive 150.
          </p>
          <p>
            Get that wrong and a chargeback <em>adds</em> $150 to your commission total instead of
            subtracting it &mdash; a $300 error on a single line, in the direction that makes
            everything look fine.
          </p>

          <h2>4. Dates are ambiguous, and the statement period doesn&rsquo;t save you</h2>
          <p>
            <code>03/06/2026</code> is either 3 June or 6 March. People reach for the statement
            period to resolve it &mdash; but that is the wrong signal, because a policy effective in
            March legitimately pays commission in June. The effective date has no obligation to fall
            inside the statement period.
          </p>
          <p>
            What actually works is reading the whole column. If any row anywhere in that column has
            a first component above 12, the column is DD/MM and every other row follows. If nothing
            in the column settles it, the honest answer is to flag the ambiguity rather than pick.
          </p>

          <h2>The pattern underneath all four</h2>
          <p>
            Each failure is silent. None produces an error message. A spreadsheet match either
            returns a wrong row or returns <code>#N/A</code>, and <code>#N/A</code> is
            indistinguishable from a genuinely unpaid policy &mdash; which is the one thing you were
            trying to find.
          </p>
          <p>
            That is the real argument against doing this by formula. Not that it is slow. That when
            it is wrong, it looks right.
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
