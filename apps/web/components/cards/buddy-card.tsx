import Image from "next/image";
import Link from "next/link";
import { MapPin, ArrowUpRight } from "lucide-react";
import type { Profile, BuddyService } from "@findbuddy/types";
import { feeLabel } from "@findbuddy/utils";
import { Badge } from "@/components/ui/badge";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { Rating } from "@/components/ui/rating";
export function BuddyCard({
  profile,
  service,
}: {
  profile: Profile;
  service?: BuddyService;
}) {
  return (
    <article className="card buddy-card">
      <Link
        href={`/buddies/${profile.userId}`}
        className="buddy-photo"
        aria-label={`View ${profile.name}'s profile`}
      >
        <Image
          src={profile.image}
          alt={profile.name}
          fill
          sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
        />
        {profile.isIdentityVerified && (
          <span className="photo-badge">
            <VerifiedBadge />
          </span>
        )}
        <span className="photo-arrow">
          <ArrowUpRight size={19} />
        </span>
      </Link>
      <div className="buddy-content">
        <div className="row between">
          <h3>
            <Link href={`/buddies/${profile.userId}`}>{profile.name}</Link>
          </h3>
          <Rating value={profile.averageRating} count={profile.ratingCount} />
        </div>
        <p className="row muted small">
          <MapPin size={13} />
          {profile.city}
        </p>
        <div className="row interest-tags">
          {profile.interests.slice(0, 3).map((i) => (
            <Badge key={i}>{i}</Badge>
          ))}
        </div>
        {service && (
          <div className="buddy-service">
            <div>
              <span className="muted small">{service.title}</span>
              <strong>{feeLabel(service)}</strong>
            </div>
            <Link
              href={`/services/${service._id}`}
              className="round-link"
              aria-label={`View ${service.title}`}
            >
              <ArrowUpRight size={20} />
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}
