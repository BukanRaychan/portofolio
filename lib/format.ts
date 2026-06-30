// Display a start/end pair as "Start – End", or "Start – Present" when ongoing.
export function formatPeriod(
  start?: string | null,
  end?: string | null,
): string {
  const s = start?.trim();
  const e = end?.trim();
  if (s && e) return `${s} – ${e}`;
  if (s) return `${s} – Present`;
  return e ?? "";
}

// Ongoing = a start with no end date.
export function isOngoing(start?: string | null, end?: string | null): boolean {
  return !!start?.trim() && !end?.trim();
}
