import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";
import type { Plan } from "@findbuddy/types";
import { dateLabel, timeLabel, currency } from "@findbuddy/utils";
import { ButtonLink } from "@/components/ui/button";
export function PlanCard({
  plan,
  host,
  participants,
}: {
  plan: Plan;
  host: string;
  participants: number;
}) {
  return (
    <article className="card plan-card">
      <Link className="plan-photo" href={`/plans/${plan._id}`}>
        <Image
          src={plan.image}
          alt={plan.title}
          fill
          sizes="(max-width:640px) 100vw, 180px"
        />
      </Link>
      <div className="plan-content">
        <div className="row between">
          <h3>
            <Link href={`/plans/${plan._id}`}>{plan.title}</Link>
          </h3>
          <span className="accent small">
            {plan.pricingType === "FREE" ? "Free plan" : currency(plan.price)}
          </span>
        </div>
        <p className="row small muted">
          <CalendarDays size={14} />
          {dateLabel(plan.date)} · {timeLabel(plan.date)}
        </p>
        <p className="row small muted">
          <MapPin size={14} />
          {plan.locationText}
        </p>
        <div className="row between plan-bottom">
          <div>
            <p className="small">Hosted by {host}</p>
            <p className="row small muted">
              <Users size={14} />
              {participants}/{plan.peopleRequired} going
            </p>
          </div>
          <ButtonLink small href={`/plans/${plan._id}`}>
            View plan
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
