/**
 * K3 measurement.
 *
 * The carrier format tail is the largest risk in this business: if every new
 * agency arrives with five layouts we have never seen, support cost never
 * amortises and the margin dies. The plan commits to measuring it from the very
 * first upload rather than retrofitting it later, so this runs on the hot path.
 *
 * Stage 1 records to structured logs, which the hosting platform retains and which
 * cost nothing. That is adequate for the first few hundred uploads and honest
 * about its limits: logs roll off, so this is a measurement instrument, not a
 * durable store. Moving it to a real table is a Stage 5 task.
 *
 * Nothing here records file contents, insured names, policy numbers, or anything
 * derived from a customer's data. Only the SHAPE of the file.
 */

import type { ConversionTelemetry } from "./convert";

const PREFIX = "K3_UPLOAD";

export interface UploadEvent extends ConversionTelemetry {
  /** Extension only - never the filename, which can contain an agency's name. */
  fileExtension: string;
  fileSizeBytes: number;
  /** Did the customer get something usable out of this upload? */
  succeeded: boolean;
  errorCodes: string[];
}

export function recordUpload(event: UploadEvent): void {
  // Single-line JSON with a stable prefix so it is greppable in platform logs and
  // parseable without a log pipeline.
  try {
    console.log(`${PREFIX} ${JSON.stringify(event)}`);
  } catch {
    // Telemetry must never break a conversion.
  }
}

/**
 * The headline K3 number: of the layouts seen, how many were new?
 *
 * Kill criterion K3 fires if, after 25 agencies, more than 40% of uploads still
 * need a new profile.
 */
export function newLayoutRate(events: readonly UploadEvent[]): number {
  if (events.length === 0) return 0;
  const novel = events.filter((e) => !e.profileExisted).length;
  return novel / events.length;
}
