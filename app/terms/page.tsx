import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms — Statement Sweep",
  description: "Terms of use for the Statement Sweep commission statement converter.",
};

export default function Terms() {
  return (
    <main>
      <section>
        <div className="wrap narrow">
          <h1>Terms</h1>
          <p className="lede">
            Short version: this is a free tool that reformats a file. Check its output before you
            act on it.
          </p>

          <h2>It flags things for your review. It does not decide anything.</h2>
          <p>
            When this tool says a rate looks inconsistent or a total does not add up, that is a
            prompt to go and look &mdash; not a finding, not an audit, and not a statement that a
            carrier underpaid you. Verify anything before you raise it with a carrier. Your
            relationship with your carriers is yours, and we are not a party to it.
          </p>

          <h2>No warranty</h2>
          <p>
            The tool is provided as is, without warranty of any kind. We have tested it and it
            refuses to produce output when it detects that it has misread a file &mdash; but no
            parser is perfect, and you remain responsible for the accuracy of your own books and
            filings.
          </p>

          <h2>Liability</h2>
          <p>
            To the fullest extent the law allows, we are not liable for any loss arising from use of
            this tool, including commission you did or did not pursue as a result of its output.
            This is a free tool and is offered on that basis.
          </p>

          <h2>Your data</h2>
          <p>
            You keep all rights to anything you upload. We claim none. See the{" "}
            <a href="/privacy">privacy page</a> for what happens to a file &mdash; briefly, it is
            read and discarded.
          </p>

          <h2>Acceptable use</h2>
          <p>
            Do not upload files you do not have the right to process, and do not use the tool to
            attack the service or anyone else. We may block abusive use.
          </p>

          <h2>Independence</h2>
          <p>
            Statement Sweep is independent. We are not affiliated with, endorsed by, or partnered
            with any insurance carrier or agency management system. Carrier and product names are
            used only to describe compatibility.
          </p>

          <h2>Changes</h2>
          <p>
            These terms may change as the product does. Material changes will be noted on this page.
          </p>
        </div>
      </section>
    </main>
  );
}
