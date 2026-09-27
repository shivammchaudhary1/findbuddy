"use client";
import { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useDemo } from "@/hooks/demo-provider";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrustScore } from "@/features/trust/trust-score";
import { ModerationDialog } from "./moderation-dialog";
export function AdminUserDetail({ id }: { id: string }) {
  const { data } = useDemo();
  const [review, setReview] = useState(false);
  const user = data.users.find((u) => u._id === id),
    profile = data.profiles.find((p) => p.userId === id);
  if (!user || !profile) notFound();
  return (
    <main id="main-content" className="stack">
      <Link href="/admin/users" className="text-link">
        ← All users
      </Link>
      <div className="row">
        <Avatar name={profile.name} src={profile.image} />
        <h1>{profile.name}</h1>
      </div>
      <div className="row">
        <Badge>{user.accountStatus.toLowerCase()}</Badge>
        <Badge>
          {profile.isIdentityVerified ? "Verified" : "Not verified"}
        </Badge>
      </div>
      <p className="muted">
        {user.email} · {profile.city}
      </p>
      <p>{profile.bio}</p>
      <div>
        <Button variant="secondary" onClick={() => setReview(true)}>
          Review account status
        </Button>
      </div>
      <TrustScore
        trust={data.trustScores.find((t) => t.userId === id)}
        detailed
      />
      <section className="card card-padding stack">
        <h2>Reported concerns</h2>
        {data.reports
          .filter((r) => r.reportedUserId === id)
          .map((r) => (
            <p key={r._id}>
              {r.category} · {r.status.toLowerCase()}
              <br />
              {r.description}
            </p>
          ))}
        {!data.reports.some((r) => r.reportedUserId === id) && (
          <p className="muted">No reports in the sample records.</p>
        )}
      </section>
      {review && (
        <ModerationDialog
          target={{
            kind: "user",
            id,
            title: profile.name,
            options: ["SUSPENDED", "BLOCKED", "ACTIVE"],
          }}
          onClose={() => setReview(false)}
        />
      )}
    </main>
  );
}
