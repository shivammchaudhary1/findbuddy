import Image from "next/image";
import type { BuddyService } from "@findbuddy/types";
import { feeLabel } from "@findbuddy/utils";
import { ButtonLink } from "@/components/ui/button";
export function ServiceCard({ service }: { service: BuddyService }) {
  return (
    <article className="card service-card">
      <div className="service-photo">
        <Image
          src={service.image}
          alt={service.title}
          fill
          sizes="(max-width:640px) 100vw, 160px"
        />
      </div>
      <div className="service-content">
        <h3>{service.title}</h3>
        <p className="muted small">{service.description}</p>
        <div className="row between">
          <strong>{feeLabel(service)}</strong>
          <ButtonLink href={`/services/${service._id}`} small>
            View activity
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
