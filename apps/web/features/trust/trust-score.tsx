import { ShieldCheck } from "lucide-react";
import type { TrustScore as TrustData } from "@findbuddy/types";
import { recommendationLabel } from "@findbuddy/utils";
import { Badge } from "@/components/ui/badge";
export function TrustScore({
  trust,
  detailed = false,
}: {
  trust?: TrustData;
  detailed?: boolean;
}) {
  return (
    <section
      className="card card-padding stack trust-panel"
      aria-label="Trust information"
    >
      <div className="row between">
        <span className="row">
          <ShieldCheck size={20} />
          <strong>Trust Score</strong>
        </span>
        <strong className="trust-number">
          {trust ? `${trust.finalScore}/100` : "Unavailable"}
        </strong>
      </div>
      {trust && (
        <>
          <Badge
            tone={trust.recommendation === "RECOMMENDED" ? "success" : "brand"}
          >
            {recommendationLabel(trust.recommendation)}
          </Badge>
          <p className="small muted">
            {trust.completedBookings} completed bookings ·{" "}
            {trust.repeatBookings} repeat bookings
          </p>
          {detailed && (
            <ul className="trust-reasons">
              {trust.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          )}
        </>
      )}
      <p className="small muted">
        Trust indicators are advisory and do not guarantee safety.
      </p>
    </section>
  );
}
