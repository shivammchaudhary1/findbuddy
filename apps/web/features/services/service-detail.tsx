"use client";
import { useDemo } from "@/hooks/demo-provider";
import { canViewProfile } from "@/lib/data/visibility";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Clock } from "lucide-react";
import { getService } from "@/lib/data/services";
import { getProfile } from "@/lib/data/users";
import { getTrust } from "@/lib/data/trust";
import { Avatar } from "@/components/ui/avatar";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { TrustScore } from "@/features/trust/trust-score";
import { RequestForm } from "@/features/bookings/request-form";
export function ServiceDetail({ id }: { id: string }) {
  const { data } = useDemo();
  const service = getService(id, data);
  if (!service) notFound();
  const profile = getProfile(service.providerId, data);
  if (!profile || !canViewProfile(data, profile.userId)) notFound();
  return (
    <main id="main-content" className="container page stack">
      <Link href={`/buddies/${profile.userId}`} className="text-link">
        <ArrowLeft size={16} /> Back to {profile.name}&apos;s profile
      </Link>
      <div className="detail-layout">
        <div className="stack">
          <div className="detail-photo">
            <Image
              src={service.image}
              alt={service.title}
              fill
              sizes="(max-width:768px) 100vw, 65vw"
              preload
            />
          </div>
          <div className="row">
            <p className="eyebrow">A shared activity</p>
          </div>
          <h1>{service.title}</h1>
          <Link className="row" href={`/buddies/${profile.userId}`}>
            <Avatar name={profile.name} src={profile.image} />
            <span>
              Hosted by <strong>{profile.name}</strong>
            </span>
            {profile.isIdentityVerified && <VerifiedBadge />}
          </Link>
          <p className="muted">{service.description}</p>
          <p className="row muted">
            <MapPin size={17} />
            {service.locationText}
          </p>
          <section className="card card-padding stack">
            <h2>Availability</h2>
            {service.availability.length ? (
              service.availability.map((a) => (
                <p className="row muted" key={a.dayOfWeek}>
                  <Clock size={16} />
                  {
                    [
                      "Sunday",
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                    ][a.dayOfWeek]
                  }{" "}
                  · {a.startTime}–{a.endTime} IST
                </p>
              ))
            ) : (
              <p className="muted">Availability has not been provided.</p>
            )}
          </section>
          <TrustScore trust={getTrust(profile.userId, data)} />
        </div>
        <aside>
          <RequestForm key={service._id} service={service} />
        </aside>
      </div>
    </main>
  );
}
