"use client";
import { useDemo } from "@/hooks/demo-provider";
import { SafetyActions } from "@/features/safety/safety-actions";
import { canViewProfile } from "@/lib/data/visibility";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getProfile, getUserServices } from "@/lib/data/users";
import { getTrust, getReviews } from "@/lib/data/trust";
import { Badge } from "@/components/ui/badge";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { Rating } from "@/components/ui/rating";
import { TrustScore } from "@/features/trust/trust-score";
import { ServiceCard } from "@/components/cards/service-card";
import { EmptyState } from "@/components/feedback/empty-state";
export function BuddyDetail({ id }: { id: string }) {
  const { data } = useDemo();
  const profile = getProfile(id, data);
  if (!profile || !canViewProfile(data, id)) notFound();
  const services = getUserServices(id, data).filter(
    (s) => s.status === "ACTIVE",
  );
  const reviews = getReviews(id, data);
  return (
    <main id="main-content" className="container page stack">
      <Link href="/explore" className="text-link">
        <ArrowLeft size={16} /> Back to Explore
      </Link>
      <div className="profile-layout">
        <div className="profile-image">
          <Image
            src={profile.image}
            alt={profile.name}
            fill
            sizes="(max-width:768px) 100vw, 380px"
            preload
          />
        </div>
        <div className="stack">
          <div className="row">
            <h1>{profile.name}</h1>
            {profile.isIdentityVerified && <VerifiedBadge />}
          </div>
          <p className="row muted">
            <MapPin size={17} />
            {profile.age} · {profile.city}
            <Rating value={profile.averageRating} count={profile.ratingCount} />
          </p>
          <div className="row">
            {profile.interests.map((i) => (
              <Badge key={i}>{i}</Badge>
            ))}
          </div>
          <div className="stack">
            <h2>About me</h2>
            <p className="muted">{profile.bio}</p>
            <h3>Languages</h3>
            <div className="row">
              {profile.languages.map((l) => (
                <Badge key={l}>{l}</Badge>
              ))}
            </div>
          </div>
          <TrustScore trust={getTrust(id, data)} />
          <SafetyActions userId={id} />
        </div>
      </div>
      <section className="stack">
        <h2>Activities with {profile.name}</h2>
        <p className="muted">
          Choose an activity to see its fee, availability, and request details.
        </p>
        {services.length ? (
          services.map((s) => <ServiceCard key={s._id} service={s} />)
        ) : (
          <EmptyState
            title="No activities yet"
            description="This buddy hasn't published an activity."
          />
        )}
      </section>
      <section className="stack">
        <h2>Reviews</h2>
        {reviews.length ? (
          reviews.map((r) => (
            <article className="card card-padding stack" key={r._id}>
              <div className="row between">
                <strong>
                  {getProfile(r.reviewerId, data)?.name ?? "Member"}
                </strong>
                <Rating value={r.overallRating} count={1} />
              </div>
              <p className="muted">{r.comment}</p>
            </article>
          ))
        ) : (
          <p className="muted">No written reviews available in this preview.</p>
        )}
      </section>
    </main>
  );
}
