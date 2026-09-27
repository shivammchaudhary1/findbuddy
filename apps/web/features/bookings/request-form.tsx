"use client";
import { useState, type FormEvent } from "react";
import type { BuddyService } from "@findbuddy/types";
import { feeLabel } from "@findbuddy/utils";
import { useDemo } from "@/hooks/demo-provider";
import { canInteract } from "@/lib/data/visibility";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export function RequestForm({ service }: { service: BuddyService }) {
  const { data, setData } = useDemo();
  const [error, setError] = useState("");
  const [created, setCreated] = useState("");
  const self = service.providerId === data.currentUser.userId;
  const unavailable = !canInteract(data, service.providerId);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const date = String(form.get("date"));
    const time = String(form.get("time"));
    const scheduledAt = new Date(`${date}T${time}:00+05:30`);
    if (!Number.isFinite(scheduledAt.getTime()) || scheduledAt <= new Date()) {
      setError("Choose a future date and time.");
      return;
    }
    const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
    if (
      !service.availability.some(
        (a) =>
          a.dayOfWeek === weekday && time >= a.startTime && time < a.endTime,
      )
    ) {
      setError("Choose a time within the activity's listed availability.");
      return;
    }
    if (self || unavailable || service.status !== "ACTIVE") return;
    const id = `booking-${crypto.randomUUID()}`;
    setData((previous) => ({
      ...previous,
      conversations: [
        ...previous.conversations,
        {
          _id: `chat-${id}`,
          type: "BOOKING",
          referenceId: id,
          participantIds: [previous.currentUser.userId, service.providerId],
        },
      ],
      bookings: [
        {
          _id: id,
          serviceId: service._id,
          providerId: service.providerId,
          consumerId: previous.currentUser.userId,
          scheduledAt: scheduledAt.toISOString(),
          status: "REQUESTED",
          serviceSnapshot: {
            title: service.title,
            category: service.category,
            pricingType: service.pricingType,
            price: service.price,
          },
          paymentRequired: service.price > 0,
          paymentStatus: "PENDING",
          locationText: service.locationText,
        },
        ...previous.bookings,
      ],
    }));
    setCreated(id);
    setError("");
  }
  return (
    <section id="request" className="card card-padding stack booking-panel">
      <h2>Make a plan</h2>
      <p className="muted small">{service.title}</p>
      <strong className="service-price">{feeLabel(service)}</strong>
      {created ? (
        <div className="stack" role="status">
          <h3>Request added to this preview</h3>
          <p className="muted small">
            No request was sent to another person. This booking resets when you
            reload.
          </p>
          <ButtonLink href={`/bookings/${created}`}>View request</ButtonLink>
        </div>
      ) : (
        <form className="stack" onSubmit={submit}>
          <Input
            id="booking-date"
            name="date"
            type="date"
            label="Date"
            required
          />
          <Input
            id="booking-time"
            name="time"
            type="time"
            label="Time (India)"
            required
          />
          <p className="small muted">Meeting area: {service.locationText}</p>
          {error && (
            <p role="alert" className="form-message">
              {error}
            </p>
          )}
          <Button
            type="submit"
            disabled={self || unavailable || service.status !== "ACTIVE"}
          >
            {self
              ? "This is your activity"
              : unavailable || service.status !== "ACTIVE"
                ? "Activity unavailable"
                : "Send request"}
          </Button>
          <p className="small muted">
            Preview only. No payment or message is sent. Agree on a public
            meeting place before meeting.
          </p>
        </form>
      )}
    </section>
  );
}
