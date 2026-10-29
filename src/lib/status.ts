import type { Traffic } from "./deadline";

export const STATUS: Record<Traffic, { label: string; badge: string }> = {
  red: { label: "Dringend", badge: "badge-red" },
  yellow: { label: "Bald fällig", badge: "badge-yellow" },
  green: { label: "Im Plan", badge: "badge-green" },
  ended: { label: "Beendet", badge: "badge-ended" },
};

export function daysText(days: number): string {
  if (days === 0) return "heute";
  if (days === 1) return "morgen";
  return `in ${days} Tagen`;
}

export const dateDe = (iso: string) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });

export const INTERVALS: [number, string][] = [
  [1, "monatlich"],
  [3, "vierteljährlich"],
  [6, "halbjährlich"],
  [12, "jährlich"],
];
