import type { Traffic } from "@/lib/deadline";
import { STATUS } from "@/lib/status";
import { AlertIcon, CheckIcon, CalendarIcon } from "./icons";

export function StatusBadge({ traffic }: { traffic: Traffic }) {
  const s = STATUS[traffic];
  // Farbe ist nie der einzige Träger: Icon + Text
  const Icon = traffic === "red" ? AlertIcon : traffic === "green" ? CheckIcon : CalendarIcon;
  return (
    <span className={`badge ${s.badge}`}>
      <Icon width={13} height={13} />
      {s.label}
    </span>
  );
}
