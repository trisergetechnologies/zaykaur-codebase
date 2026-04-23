/** Short label for chart axis from `YYYY-MM-DD`. */
export function shortChartDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}
