import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy — Statement Sweep",
  description: "What happens to a commission statement you upload, stated precisely.",
};

export default function Privacy() {
  return (
    <main>
      <section>
        <div className="wrap narrow">
          <h1>Privacy</h1>
          <p className="lede">
            You are being asked to upload a document containing your clients&rsquo; names and
            policy numbers. Here is exactly what happens to it.
          </p>

          <h2>What happens to your file</h2>
          <ul className="plain">
            <li>
              <strong>It is read in memory and discarded.</strong> The file is not written to disk,
              not saved to a database, and not copied anywhere. When the request finishes, it is
              gone.
            </li>
            <li>
              <strong>The converted result is never stored.</strong> It is returned to your browser
              and nowhere else. If you close the tab without downloading, it no longer exists.
            </li>
            <li>
              <strong>Nothing is used to train any model.</strong> Not now, and this will not change
              without a prominent notice and an opt-in.
            </li>
            <li>
              <strong>No third party receives your file.</strong> Conversion is deterministic code
              running on our own server. No part of your statement is sent to an AI provider.
            </li>
          </ul>

          <h2>What we do keep</h2>
          <p>
            We record the <em>shape</em> of each upload so we can learn how much carrier-format
            variety exists. Specifically: the file extension, the file size, the number of lines,
            which carrier was detected, and the column headings.
          </p>
          <p>
            <strong>Column headings only</strong> &mdash; the words at the top of each column, such
            as &ldquo;Policy Number&rdquo; or &ldquo;Comm Amt&rdquo;. Never the values underneath
            them. The code refuses to save a heading that looks like data rather than a label, and
            that check runs on every upload.
          </p>
          <p>We do not record your filename, because a filename can contain your agency&rsquo;s name.</p>

          <h2>What we do not do</h2>
          <ul className="plain">
            <li>No accounts, so no names, emails or passwords are collected.</li>
            <li>No cookies, no analytics, no tracking pixels, no advertising.</li>
            <li>No email list. Nothing here signs you up for anything.</li>
          </ul>

          <h2>Hosting</h2>
          <p>
            The site runs on Vercel, which processes requests on our behalf and keeps standard
            server logs including IP addresses for a limited period, as any web host does.
          </p>

          <h2>Where this is thin</h2>
          <p>
            This is an early-stage tool. It has no accounts and stores no documents, which removes
            most of what a privacy policy usually has to cover. If we later add accounts, stored
            history, or email, this page changes first and says so plainly.
          </p>
          <p className="note">
            Questions, or want something deleted? There is nothing to delete &mdash; but if you want
            to check that, ask and we will walk you through the code.
          </p>
        </div>
      </section>
    </main>
  );
}
