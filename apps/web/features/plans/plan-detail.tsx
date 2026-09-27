"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, CalendarDays, MapPin, Users } from "lucide-react";
import { canViewProfile, canInteract } from "@/lib/data/visibility";
import { useDemo } from "@/hooks/demo-provider";
import { dateLabel, timeLabel, currency } from "@findbuddy/utils";
import { Button, ButtonLink } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/feedback/empty-state";
export function PlanDetail({ id }: { id: string }) {
  const { data, setData } = useDemo();
  const [notice, setNotice] = useState("");
  const plan = data.plans.find((p) => p._id === id);
  if (!plan || !canViewProfile(data, plan.creatorId))
    return (
      <main id="main-content" className="container page">
        <EmptyState
          as="h1"
          title="Plan unavailable"
          description="This plan may have been removed, or its preview session has ended."
          action={<ButtonLink href="/plans">Explore plans</ButtonLink>}
        />
      </main>
    );
  const host = data.profiles.find((p) => p.userId === plan.creatorId);
  const own = plan.creatorId === data.currentUser.userId;
  const requests = data.planJoinRequests.filter((r) => r.planId === id);
  const joined = requests.filter((r) => r.status === "ACCEPTED").length + 1;
  const mine = requests.find((r) => r.requesterId === data.currentUser.userId);
  const closed =
    !canInteract(data, plan.creatorId) ||
    plan.status !== "PUBLISHED" ||
    new Date(plan.date) < new Date() ||
    joined >= plan.peopleRequired;
  function join() {
    if (own || closed || mine || !canInteract(data, plan!.creatorId)) return;
    setData((previous) => ({
      ...previous,
      planJoinRequests: [
        ...previous.planJoinRequests,
        {
          _id: crypto.randomUUID(),
          planId: id,
          requesterId: previous.currentUser.userId,
          status: "PENDING",
        },
      ],
    }));
    setNotice(
      "Join request added to this preview. No message was sent; it resets on reload.",
    );
  }
  function decide(requestId: string, status: "ACCEPTED" | "REJECTED") {
    if (!own || (status === "ACCEPTED" && joined >= plan!.peopleRequired))
      return;
    setData((previous) => ({
      ...previous,
      planJoinRequests: previous.planJoinRequests.map((r) =>
        r._id === requestId ? { ...r, status } : r,
      ),
    }));
    setNotice("Request updated in this preview only.");
  }
  return (
    <main id="main-content" className="container page stack">
      <Link href="/plans" className="text-link">
        <ArrowLeft size={16} /> All plans
      </Link>
      <div className="detail-layout">
        <div className="stack">
          <div className="detail-photo">
            <Image
              src={plan.image}
              alt={plan.title}
              fill
              sizes="(max-width:768px) 100vw, 65vw"
              preload
            />
          </div>
          <div className="row">
            <Badge tone="brand">
              {plan.pricingType === "FREE" ? "Free plan" : "Paid plan"}
            </Badge>
            <Badge>{plan.status.toLowerCase()}</Badge>
          </div>
          <h1>{plan.title}</h1>
          <Link href={`/buddies/${plan.creatorId}`} className="row">
            <Avatar name={host?.name ?? "Host"} src={host?.image} />
            <span>
              Hosted by <strong>{host?.name ?? "Host unavailable"}</strong>
            </span>
          </Link>
          <p className="muted">{plan.description}</p>
          <section className="stack">
            <h2>Who&apos;s coming</h2>
            <div className="row">
              {[
                plan.creatorId,
                ...requests
                  .filter((r) => r.status === "ACCEPTED")
                  .map((r) => r.requesterId),
              ].map((userId) => {
                const p = data.profiles.find((x) => x.userId === userId);
                return p ? (
                  <Link
                    className="row badge"
                    key={userId}
                    href={`/buddies/${userId}`}
                  >
                    <Avatar name={p.name} src={p.image} />
                    {p.name}
                  </Link>
                ) : null;
              })}
            </div>
          </section>
          {own && (
            <section className="stack">
              <h2>Join requests</h2>
              {requests.filter((r) => r.status === "PENDING").length ? (
                requests
                  .filter((r) => r.status === "PENDING")
                  .map((r) => (
                    <div className="card card-padding row between" key={r._id}>
                      <span>
                        {data.profiles.find((p) => p.userId === r.requesterId)
                          ?.name ?? "Member"}
                      </span>
                      <div className="row">
                        <Button
                          small
                          disabled={closed}
                          onClick={() => decide(r._id, "ACCEPTED")}
                        >
                          Accept
                        </Button>
                        <Button
                          small
                          variant="secondary"
                          onClick={() => decide(r._id, "REJECTED")}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="muted">No pending join requests.</p>
              )}
            </section>
          )}
        </div>
        <aside>
          <div className="card card-padding stack booking-panel">
            <h2>Let&apos;s make a plan</h2>
            <p className="row">
              <CalendarDays size={18} />
              {dateLabel(plan.date)} · {timeLabel(plan.date)}
            </p>
            <p className="row muted">
              <MapPin size={18} />
              {plan.locationText}
            </p>
            <p className="row muted">
              <Users size={18} />
              {joined}/{plan.peopleRequired} going
            </p>
            <strong className="service-price">
              {plan.pricingType === "FREE"
                ? "Free plan"
                : `${currency(plan.price)} per participant`}
            </strong>
            <Button onClick={join} disabled={own || closed || !!mine}>
              {own
                ? "You're hosting"
                : mine?.status === "ACCEPTED"
                  ? "Joined"
                  : mine
                    ? `Request ${mine.status.toLowerCase()}`
                    : closed
                      ? "Joining unavailable"
                      : "Join plan"}
            </Button>
            {notice && (
              <p role="status" className="form-message">
                {notice}
              </p>
            )}
            <p className="small muted">
              Preview only. Requests stay in this session. Choose a public
              meeting place and share your plans with someone you trust.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
