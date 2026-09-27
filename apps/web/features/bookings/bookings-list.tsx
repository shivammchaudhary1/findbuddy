"use client";
import { useState } from "react";
import { CalendarDays, MapPin } from "lucide-react";
import { useDemo } from "@/hooks/demo-provider";
import { bookingStatuses } from "@findbuddy/constants";
import { dateLabel, timeLabel, feeLabel } from "@findbuddy/utils";
import { ButtonLink } from "@/components/ui/button";
import { FilterChip } from "@/components/ui/filter-chip";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/feedback/empty-state";
export function BookingsList() {
  const { data } = useDemo();
  const [status, setStatus] = useState("ALL");
  const user = data.currentUser.userId;
  const bookings = data.bookings.filter(
    (b) =>
      (b.consumerId === user || b.providerId === user) &&
      (status === "ALL" || b.status === status),
  );
  return (
    <main id="main-content" className="container page stack">
      <p className="eyebrow">Good things on your calendar</p>
      <h1>My bookings</h1>
      <p className="muted">
        Keep track of your requests and upcoming activities.
      </p>
      <div className="row">
        <FilterChip active={status === "ALL"} onClick={() => setStatus("ALL")}>
          All
        </FilterChip>
        {bookingStatuses.map((s) => (
          <FilterChip
            key={s}
            active={status === s}
            onClick={() => setStatus(s)}
          >
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </FilterChip>
        ))}
      </div>
      {bookings.length ? (
        bookings.map((b) => (
          <article className="card card-padding booking-row" key={b._id}>
            <div className="stack">
              <div className="row">
                <h2>{b.serviceSnapshot.title}</h2>
                <Badge
                  tone={
                    b.status === "ACCEPTED" || b.status === "COMPLETED"
                      ? "success"
                      : "brand"
                  }
                >
                  {b.status.toLowerCase()}
                </Badge>
              </div>
              <p className="muted small">
                {b.providerId === user
                  ? "You're hosting"
                  : `Hosted by ${data.profiles.find((p) => p.userId === b.providerId)?.name ?? "Member"}`}
              </p>
              <p className="row muted small">
                <CalendarDays size={15} />
                {dateLabel(b.scheduledAt)} · {timeLabel(b.scheduledAt)}
                <MapPin size={15} />
                {b.locationText}
              </p>
            </div>
            <div className="stack booking-row-action">
              <strong>{feeLabel(b.serviceSnapshot)}</strong>
              <ButtonLink href={`/bookings/${b._id}`} small>
                View booking
              </ButtonLink>
            </div>
          </article>
        ))
      ) : (
        <EmptyState
          title="No bookings yet"
          description="Find an activity you enjoy and send your first request."
          action={<ButtonLink href="/explore">Find a buddy</ButtonLink>}
        />
      )}
    </main>
  );
}
