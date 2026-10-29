export type TermInput = {
  startDate: string; // YYYY-MM-DD
  minTermMonths: number;
  renewalMonths: number; // 0 = endet ohne Verlängerung
  noticeDays: number;
};

export type Traffic = "green" | "yellow" | "red" | "ended";

export type DeadlineInfo = {
  termEnd: string;
  cancelBy: string;
  daysLeft: number;
  traffic: Traffic;
};

const DAY = 86_400_000;

function parse(d: string): Date {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day));
}

export function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Addiert Monate und klemmt auf Monatsende (31.01. + 1 Monat = 28./29.02.). */
export function addMonths(d: Date, months: number): Date {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + months;
  const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return new Date(Date.UTC(y, m, Math.min(d.getUTCDate(), last)));
}

export function trafficFor(daysLeft: number): Traffic {
  if (daysLeft < 30) return "red";
  if (daysLeft <= 90) return "yellow";
  return "green";
}

/**
 * Nächstes Kündigungsdatum >= heute. Die Laufzeit endet am Tag vor Ablauf der
 * Mindestlaufzeit; die Kündigung muss `noticeDays` davor eingehen.
 */
export function nextDeadline(t: TermInput, today: string): DeadlineInfo {
  const now = parse(today);
  let termEnd = addMonths(parse(t.startDate), t.minTermMonths);
  let cancelBy = new Date(termEnd.getTime() - t.noticeDays * DAY);

  while (cancelBy < now) {
    if (t.renewalMonths <= 0) {
      return { termEnd: fmt(termEnd), cancelBy: fmt(cancelBy), daysLeft: Math.round((cancelBy.getTime() - now.getTime()) / DAY), traffic: "ended" };
    }
    termEnd = addMonths(termEnd, t.renewalMonths);
    cancelBy = new Date(termEnd.getTime() - t.noticeDays * DAY);
  }

  const daysLeft = Math.round((cancelBy.getTime() - now.getTime()) / DAY);
  return { termEnd: fmt(termEnd), cancelBy: fmt(cancelBy), daysLeft, traffic: trafficFor(daysLeft) };
}
