"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { canViewProfile } from "@/lib/data/visibility";
import { useDemo } from "@/hooks/demo-provider";
import { PlanCard } from "@/components/cards/plan-card";
import { FilterChip } from "@/components/ui/filter-chip";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";
export function PlansList({
  initialTab = "Upcoming",
}: {
  initialTab?: string;
}) {
  const { data } = useDemo();
  const [tab, setTab] = useState(initialTab);
  const userId = data.currentUser.userId;
  const plans = data.plans
    .filter((p) => canViewProfile(data, p.creatorId))
    .filter((p) =>
      tab === "Created by me"
        ? p.creatorId === userId
        : tab === "Joined"
          ? data.planJoinRequests.some(
              (r) =>
                r.planId === p._id &&
                r.requesterId === userId &&
                r.status === "ACCEPTED",
            )
          : tab === "Past"
            ? p.status === "COMPLETED" || new Date(p.date) < new Date()
            : p.status === "PUBLISHED" && new Date(p.date) >= new Date(),
    );
  return (
    <main id="main-content" className="container page stack">
      <div className="section-header">
        <div className="stack">
          <p className="eyebrow">More fun together</p>
          <h1>Find your next plan</h1>
          <p className="muted">
            Join something good, or bring your own idea to life.
          </p>
        </div>
        <ButtonLink href="/plans/create">
          <Plus size={18} /> Create plan
        </ButtonLink>
      </div>
      <div className="row" aria-label="Plan filters">
        {["Upcoming", "Created by me", "Joined", "Past"].map((t) => (
          <FilterChip key={t} active={tab === t} onClick={() => setTab(t)}>
            {t}
          </FilterChip>
        ))}
      </div>
      {plans.length ? (
        <div className="grid-2">
          {plans.map((plan) => (
            <PlanCard
              key={plan._id}
              plan={plan}
              host={
                data.profiles.find((p) => p.userId === plan.creatorId)?.name ??
                "Host unavailable"
              }
              participants={
                data.planJoinRequests.filter(
                  (r) => r.planId === plan._id && r.status === "ACCEPTED",
                ).length + 1
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No plans yet"
          description="A good plan starts with an idea. Create one or explore upcoming plans."
          action={<ButtonLink href="/plans/create">Create a plan</ButtonLink>}
        />
      )}
    </main>
  );
}
