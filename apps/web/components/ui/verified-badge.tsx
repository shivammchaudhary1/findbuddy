import { BadgeCheck } from "lucide-react";
export function VerifiedBadge() {
  return (
    <span className="verified">
      <BadgeCheck size={16} aria-hidden="true" /> Verified
    </span>
  );
}
