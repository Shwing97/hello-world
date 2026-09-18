"use client";

import { useRef, useState } from "react";
import { formatCents } from "@/lib/money";
import { EXPORT_COLUMNS } from "@/lib/schema";
import type { CanonicalLine } from "@/lib/schema";
import type { Issue } from "@/lib/validate";

interface ConvertResponse {
  ok: boolean;
  lines: CanonicalLine[];
  carrier: { id: string; name: string } | null;
  issues: Issue[];
  validation: { lineTotal: number; declaredTotal: number | null; totalsAgree: boolean | null } | null;
  error?: string;
}

const MONEY_KEYS = new Set(["premiumCents", "commissionCents"]);

function cellText(line: CanonicalLine, key: keyof CanonicalLine): string {
  const value = line[key];
  if (value === null || value === undefined) return "";
  if (MONEY_KEYS.has(key)) return formatCents(value as number);
  if (key === "commissionRate") return `${((value as number) * 100).toFixed(2)}%`;
  return String(value);
}

function toCsv(lines: CanonicalLine[]): string {
  const escape = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
  const header = EXPORT_COLUMNS.map((c) => escape(c.label)).join(",");
  const body = lines.map((line) =>
    EXPORT_COLUMNS.map((c) => escape(cellText(line, c.key))).join(","),
  );
  return [header, ...body].join("\n");
}

export default function Converter() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ConvertResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    setResult(null);
    setFilename(file.name);

    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/convert", { method: "POST", body });
      const data = (await response.json()) as ConvertResponse;

      if (!response.ok) {
        setError(data.error ?? "That file could not be converted.");
      } else {
        setResult(data);
      }
    } catch {
      setError("The upload failed. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  function download() {
    if (!result) return;
    const blob = new Blob([toCsv(result.lines)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.replace(/\.[^.]+$/, "") + "-converted.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const errors = result?.issues.filter((i) => i.severity === "error") ?? [];
  const others = result?.issues.filter((i) => i.severity !== "error") ?? [];

  return (
    <>
      <div
        className={busy ? "drop busy" : "drop"}
        style={{ marginTop: 22 }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) void upload(file);
        }}
      >
        <p style={{ marginBottom: 14 }}>
          <strong>Drop a statement here</strong>, or choose a file.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.txt,.xlsx,.xlsm,.pdf"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void upload(file);
          }}
        />
        <button className="btn" disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? "Converting…" : "Choose file"}
        </button>
        <p className="note" style={{ marginTop: 14, marginBottom: 0 }}>
          CSV and Excel. Up to 8 MB. Processed and discarded — nothing is stored.
        </p>
      </div>

      {error && (
        <div className="issue error" style={{ marginTop: 18 }} role="alert">
          {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 26 }}>
          <div className="stats">
            <div className="stat">
              <div className="k">Lines</div>
              <div className="v">{result.lines.length}</div>
            </div>
            <div className="stat">
              <div className="k">Commission total</div>
              <div className="v">{formatCents(result.validation?.lineTotal ?? 0)}</div>
            </div>
            {result.validation?.declaredTotal !== null && result.validation !== null && (
              <div className="stat">
                <div className="k">Statement total</div>
                <div className="v">
                  {formatCents(result.validation.declaredTotal)}{" "}
                  {result.validation.totalsAgree ? "✓" : "✗"}
                </div>
              </div>
            )}
            {result.carrier && (
              <div className="stat">
                <div className="k">Carrier</div>
                <div className="v">{result.carrier.name}</div>
              </div>
            )}
          </div>

          {errors.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h3>Don&rsquo;t rely on this conversion</h3>
              {errors.map((issue, i) => (
                <div className="issue error" key={i}>
                  {issue.message} {issue.row ? <code>row {issue.row}</code> : null}
                </div>
              ))}
            </div>
          )}

          {others.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h3>Worth a look</h3>
              {others.slice(0, 12).map((issue, i) => (
                <div className={`issue ${issue.severity}`} key={i}>
                  {issue.message} {issue.row ? <code>row {issue.row}</code> : null}
                </div>
              ))}
              {others.length > 12 && (
                <p className="note">…and {others.length - 12} more, included in the download.</p>
              )}
            </div>
          )}

          {result.lines.length > 0 && (
            <>
              <p>
                <button className="btn" onClick={download}>
                  Download CSV
                </button>{" "}
                <span className="note">Free. No email required.</span>
              </p>

              <div className="tablewrap" style={{ maxHeight: 460, overflowY: "auto" }}>
                <table>
                  <thead>
                    <tr>
                      {EXPORT_COLUMNS.map((c) => (
                        <th key={c.key}>{c.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.lines.slice(0, 200).map((line) => (
                      <tr key={line.sourceRow}>
                        {EXPORT_COLUMNS.map((c) => {
                          const text = cellText(line, c.key);
                          const numeric = MONEY_KEYS.has(c.key) || c.key === "commissionRate";
                          return (
                            <td
                              key={c.key}
                              className={
                                numeric ? (text.startsWith("-") ? "num neg" : "num") : undefined
                              }
                            >
                              {text}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {result.lines.length > 200 && (
                <p className="note">
                  Showing the first 200 of {result.lines.length} lines. The download has all of them.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
