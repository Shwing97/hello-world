import type { Metadata } from "next";
import Link from "next/link";
import { INDEXABLE } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  robots: INDEXABLE ? { index: true, follow: true } : { index: false, follow: false },
  title: "Statement Sweep — find the commission your carriers didn't pay you",
  description:
    "Convert any carrier commission statement to clean, columnar data. Free tool for independent insurance agencies.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site">
          <div className="wrap">
            <Link href="/" className="brand">
              Statement<span>Sweep</span>
            </Link>
            <nav className="site">
              <Link href="/tools/commission-statement-converter">Free converter</Link>
              <Link href="/#how">How it works</Link>
              <Link href="/#pricing">Pricing</Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="site">
          <div className="wrap">
            <p style={{ margin: 0 }}>
              Statement Sweep — an independent tool for insurance agencies. Not affiliated with
              any carrier or agency management system.
            </p>
            <p style={{ margin: "8px 0 0" }}>
              <Link href="/privacy">Privacy</Link> &middot; <Link href="/terms">Terms</Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
