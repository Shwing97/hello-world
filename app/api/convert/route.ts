import { NextResponse } from "next/server";
import { convertStatement, type SourceFormat } from "@/lib/convert";
import { MemoryProfileStore } from "@/lib/profiles";

export const runtime = "nodejs";

/**
 * Stage 0 profile store: in-memory, per server instance, lost on restart.
 *
 * That is deliberate. Persisting the shared profile library is a Stage 5 decision
 * that needs a real database and a retention policy behind it, and shipping a
 * half-persisted version now would make the K3 numbers unreliable.
 */
const store = new MemoryProfileStore();

const MAX_BYTES = 8 * 1024 * 1024;

function formatFor(filename: string): SourceFormat | null {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".csv") || lower.endsWith(".txt")) return "csv";
  if (lower.endsWith(".xlsx") || lower.endsWith(".xlsm")) return "xlsx";
  if (lower.endsWith(".pdf")) return "pdf";
  return null;
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Could not read the upload." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file was uploaded." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "That file is larger than 8 MB. Split it or send a narrower date range." },
      { status: 413 },
    );
  }

  const format = formatFor(file.name);
  if (!format) {
    return NextResponse.json(
      { error: "Unsupported file type. Upload a .csv or .xlsx export." },
      { status: 415 },
    );
  }

  try {
    const result =
      format === "csv"
        ? await convertStatement({ filename: file.name, format, text: await file.text(), store })
        : await convertStatement({
            filename: file.name,
            format,
            buffer: await file.arrayBuffer(),
            store,
          });

    return NextResponse.json({
      ok: result.ok,
      lines: result.lines,
      headers: result.headers,
      carrier: result.carrier ? { id: result.carrier.carrier.id, name: result.carrier.carrier.name } : null,
      issues: result.issues,
      validation: result.validation,
      // Returned so the conversion is auditable from the browser. In Stage 1 this
      // is also what gets recorded to measure the carrier format tail (K3).
      telemetry: result.telemetry,
    });
  } catch (err) {
    console.error("conversion failed", err);
    return NextResponse.json(
      { error: "That file could not be read. If it came from a carrier portal, try exporting it again as CSV." },
      { status: 422 },
    );
  }
}
