import { Star } from "lucide-react";
export function Rating({ value, count }: { value: number; count: number }) {
  return (
    <span className="rating">
      <Star size={14} aria-hidden="true" />
      {count ? `${value.toFixed(1)} (${count})` : "New"}
    </span>
  );
}
