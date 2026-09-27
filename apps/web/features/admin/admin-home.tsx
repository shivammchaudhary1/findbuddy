"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useDemo } from "@/hooks/demo-provider";
import { AuditTrail } from "./admin-module";
export function AdminHome() {
  const { data } = useDemo();
  return (
    <main id="main-content" className="stack">
      <p className="eyebrow">Care for the community</p>
      <h1>Moderation workspace</h1>
      <p className="muted">
        Review activity, respond to concerns, and keep decisions accountable.
      </p>
      <div className="grid-2">
        {data.navigation.admin.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="card card-padding row between"
          >
            <h2>{n.label}</h2>
            <ArrowUpRight size={22} />
          </Link>
        ))}
      </div>
      <AuditTrail />
    </main>
  );
}
