"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, MapPin, ShieldCheck } from "lucide-react";
import type { Booking } from "@findbuddy/types";
import { dateLabel, timeLabel, feeLabel } from "@findbuddy/utils";
import { useDemo } from "@/hooks/demo-provider";
import { ReviewForm } from "./review-form";
import { canTransition } from "./booking-rules";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/feedback/empty-state";
export function BookingDetail({ id }: { id: string }) {
  const { data, setData } = useDemo();
  const [notice, setNotice] = useState("");
  const [checkedIn, setCheckedIn] = useState(false);
  const user = data.currentUser.userId;
  const booking = data.bookings.find(
    (b) => b._id === id && (b.providerId === user || b.consumerId === user),
  );
  if (!booking)
    return (
      <main id="main-content" className="container page">
        <EmptyState
          as="h1"
          title="Booking unavailable"
          description="This booking isn't part of your account, or its preview session has ended."
          action={<ButtonLink href="/bookings">My bookings</ButtonLink>}
        />
      </main>
    );
  const other = data.profiles.find(
    (p) =>
      p.userId ===
      (booking.providerId === user ? booking.consumerId : booking.providerId),
  );
  const conversation = data.conversations.find((c) => c.referenceId === id);
  function transition(next: Booking["status"]) {
    if (!booking || !canTransition(booking, next, user)) return;
    setData((previous) => ({
      ...previous,
      bookings: previous.bookings.map((b) =>
        b._id === id ? { ...b, status: next } : b,
      ),
    }));
    setNotice(
      `Booking ${next.toLowerCase()} in this preview. No one has been notified.`,
    );
  }
  return (
    <main id="main-content" className="container page stack">
      <Link href="/bookings" className="text-link">
        <ArrowLeft size={16} /> My bookings
      </Link>
      <div className="row">
        <p className="eyebrow">Your activity</p>
        <Badge tone="brand">{booking.status.toLowerCase()}</Badge>
      </div>
      <h1>{booking.serviceSnapshot.title}</h1>
      <div className="detail-layout">
        <div className="stack">
          <section className="card card-padding stack">
            <h2>Booking details</h2>
            <Link
              href={`/buddies/${other?.userId ?? booking.providerId}`}
              className="row"
            >
              <Avatar name={other?.name ?? "Member"} src={other?.image} />
              <span>
                {booking.providerId === user ? "Requested by" : "Hosted by"}{" "}
                <strong>{other?.name ?? "Member unavailable"}</strong>
              </span>
            </Link>
            <p className="row">
              <CalendarDays size={18} />
              {dateLabel(booking.scheduledAt)} ·{" "}
              {timeLabel(booking.scheduledAt)} IST
            </p>
            <p className="row muted">
              <MapPin size={18} />
              {booking.locationText}
            </p>
            <div className="row">
              {["ACCEPTED", "REJECTED", "CANCELLED", "COMPLETED"].map((next) =>
                canTransition(booking, next as Booking["status"], user) ? (
                  <Button
                    key={next}
                    variant={
                      next === "CANCELLED" || next === "REJECTED"
                        ? "secondary"
                        : "primary"
                    }
                    onClick={() => transition(next as Booking["status"])}
                  >
                    {
                      (
                        {
                          ACCEPTED: "Accept request",
                          REJECTED: "Reject request",
                          CANCELLED: "Cancel booking",
                          COMPLETED: "Mark completed",
                        } as Record<string, string>
                      )[next]
                    }
                  </Button>
                ) : null,
              )}
              {conversation && (
                <ButtonLink
                  href={`/messages/${conversation._id}`}
                  variant="secondary"
                >
                  Open conversation
                </ButtonLink>
              )}
            </div>
            {notice && (
              <p role="status" className="form-message">
                {notice}
              </p>
            )}
          </section>
          <section className="card card-padding stack">
            <h2 className="row">
              <ShieldCheck size={21} /> Meetup safety
            </h2>
            <p className="muted">
              Meet in a public place and let someone you trust know your plans.
            </p>
            <div className="row">
              <Button
                variant="secondary"
                disabled={booking.status !== "ACCEPTED" || checkedIn}
                onClick={() => {
                  setCheckedIn(true);
                  setData((p) => ({
                    ...p,
                    safetyEvents: [
                      ...p.safetyEvents,
                      { userId: user, type: "MEETUP_CHECK_IN" },
                    ],
                  }));
                  setNotice(
                    "Check-in recorded in this preview only. No trusted contact has been notified.",
                  );
                }}
              >
                Check in
              </Button>
              <Button
                variant="secondary"
                disabled={!checkedIn}
                onClick={() => {
                  setCheckedIn(false);
                  setData((p) => ({
                    ...p,
                    safetyEvents: [
                      ...p.safetyEvents,
                      { userId: user, type: "MEETUP_CHECK_OUT" },
                    ],
                  }));
                  setNotice("Check-out recorded in this preview only.");
                }}
              >
                Check out
              </Button>
              <Button variant="secondary" disabled>
                SOS unavailable in preview
              </Button>
            </div>
            <p className="small muted">
              This preview cannot contact emergency services or trusted
              contacts.
            </p>
          </section>
          {booking.status === "COMPLETED" && <ReviewForm bookingId={id} />}
        </div>
        <aside>
          <section className="card card-padding stack">
            <h2>Activity summary</h2>
            <strong className="service-price">
              {feeLabel(booking.serviceSnapshot)}
            </strong>
            <p className="muted small">
              The fee was saved when this booking was requested.
            </p>
            <div className="row between">
              <span>Payment</span>
              <Badge>
                {booking.paymentRequired
                  ? booking.paymentStatus.toLowerCase()
                  : "Not required"}
              </Badge>
            </div>
            {booking.paymentRequired && booking.paymentStatus !== "PAID" && (
              <>
                <Button disabled>Payment unavailable in preview</Button>
                <p className="small muted">
                  No payment is collected. Payment confirmation will come from
                  the payment provider when connected.
                </p>
              </>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}
