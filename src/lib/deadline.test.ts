import { describe, expect, it } from "vitest";
import { addMonths, fmt, nextDeadline } from "./deadline";

describe("addMonths", () => {
  it("klemmt auf Monatsende", () => {
    expect(fmt(addMonths(new Date("2025-01-31"), 1))).toBe("2025-02-28");
  });
  it("Schaltjahr", () => {
    expect(fmt(addMonths(new Date("2024-01-31"), 1))).toBe("2024-02-29");
  });
});

describe("nextDeadline", () => {
  const base = { startDate: "2025-01-01", minTermMonths: 24, renewalMonths: 12, noticeDays: 90 };

  it("erste Laufzeit, grün", () => {
    const r = nextDeadline(base, "2025-02-01");
    expect(r.termEnd).toBe("2027-01-01");
    expect(r.cancelBy).toBe("2026-10-03");
    expect(r.traffic).toBe("green");
  });

  it("gelb im 90-Tage-Fenster", () => {
    expect(nextDeadline(base, "2026-08-15").traffic).toBe("yellow");
  });

  it("rot unter 30 Tagen", () => {
    expect(nextDeadline(base, "2026-09-20").traffic).toBe("red");
  });

  it("automatische Verlängerung nach verpasster Frist", () => {
    const r = nextDeadline(base, "2026-12-01");
    expect(r.termEnd).toBe("2028-01-01");
    expect(r.cancelBy).toBe("2027-10-03");
  });

  it("ohne Verlängerung: beendet", () => {
    const r = nextDeadline({ ...base, renewalMonths: 0 }, "2026-12-01");
    expect(r.traffic).toBe("ended");
  });

  it("Frist heute ist noch rot, nicht beendet", () => {
    const r = nextDeadline(base, "2026-10-03");
    expect(r.daysLeft).toBe(0);
    expect(r.traffic).toBe("red");
  });
});
