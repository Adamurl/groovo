export function formatAlbumDate(dateStr: string, precision: "year" | "month" | "day" | string) {
  const date = new Date(dateStr);
  if (precision === "year") return date.getFullYear().toString();
  if (precision === "month")
    return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short" }).format(date);
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(date);
}
