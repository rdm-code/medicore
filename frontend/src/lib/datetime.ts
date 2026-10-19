/** ISO LocalDateTime without timezone: "2026-11-02T09:00:00" */
export function toLocalDateTimeString(date: string, time: string): string {
  // date = "YYYY-MM-DD", time = "HH:MM"
  return `${date}T${time.length === 5 ? `${time}:00` : time}`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { dateStyle: "medium" });
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** For <input type="date"> from an ISO LocalDateTime */
export function isoDatePart(iso: string): string {
  return iso.slice(0, 10);
}

/** For <input type="time"> from an ISO LocalDateTime */
export function isoTimePart(iso: string): string {
  return iso.slice(11, 16);
}
