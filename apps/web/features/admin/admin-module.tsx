"use client";
import { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useDemo } from "@/hooks/demo-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { adminRecords } from "./admin-records";
import { ModerationDialog, type ModerationTarget } from "./moderation-dialog";
export function AdminModule({ section }: { section: string }) {
  const { data } = useDemo();
  const [search, setSearch] = useState("");
  const [target, setTarget] = useState<ModerationTarget | null>(null);
  const nav = data.navigation.admin.find((n) => n.href === `/admin/${section}`);
  if (!nav) notFound();
  const rows = adminRecords(data, section).filter((r) =>
    `${r.title} ${r.detail} ${r.status}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <main id="main-content" className="stack">
      <p className="eyebrow">Community operations</p>
      <h1>{nav.label}</h1>
      <p className="muted">
        Sample records. Changes are temporary and visible in the session audit
        trail.
      </p>
      <label className="field">
        Search records
        <input
          className="input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, status, or details…"
        />
      </label>
      {rows.length ? (
        <div
          className="table-wrap"
          tabIndex={0}
          role="region"
          aria-label={`${nav.label} records`}
        >
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Record</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.title}</strong>
                    <p className="small muted">{r.detail}</p>
                    <span className="small muted">{r.id}</span>
                  </td>
                  <td>
                    <Badge>{r.status.toLowerCase()}</Badge>
                  </td>
                  <td>
                    <div className="stack">
                      {r.href && (
                        <Link className="text-link" href={r.href}>
                          User detail
                        </Link>
                      )}
                      {r.target && (
                        <Button
                          small
                          variant="secondary"
                          onClick={() => setTarget(r.target!)}
                        >
                          Review
                        </Button>
                      )}
                      {!r.href && !r.target && (
                        <span className="small muted">View only</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No records found"
          description="Try another search or return after new records are available."
        />
      )}
      {section === "services" && (
        <section className="card card-padding stack">
          <h2>Service categories</h2>
          {data.categories.map((c) => (
            <div className="row between" key={c.id}>
              <span>{c.name}</span>
              <Button
                small
                variant="ghost"
                onClick={() =>
                  setTarget({ kind: "category", id: c.id, title: c.name })
                }
              >
                Edit label
              </Button>
            </div>
          ))}
        </section>
      )}
      {section === "reports" && (
        <section className="card card-padding stack">
          <h2>Safety events</h2>
          {data.safetyEvents.length ? (
            data.safetyEvents.map((s, i) => (
              <p key={i}>
                {s.userId} · {s.type.replaceAll("_", " ")}
              </p>
            ))
          ) : (
            <p className="muted">No safety events in this preview.</p>
          )}
        </section>
      )}
      {section === "trust" && (
        <section className="card card-padding stack">
          <h2>Adjustment history</h2>
          {data.trustScoreEvents.length ? (
            data.trustScoreEvents.map((e, i) => (
              <p className="small muted" key={i}>
                {e.userId} · {e.delta > 0 ? "+" : ""}
                {e.delta} · {e.reason} ·{" "}
                {new Date(e.createdAt).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                })}{" "}
                IST
              </p>
            ))
          ) : (
            <p className="muted">No manual adjustments recorded.</p>
          )}
        </section>
      )}
      <AuditTrail />
      {target && (
        <ModerationDialog target={target} onClose={() => setTarget(null)} />
      )}
    </main>
  );
}
export function AuditTrail() {
  const { data } = useDemo();
  return (
    <section className="card card-padding stack">
      <h2>Session audit trail</h2>
      {data.adminAuditLogs.length ? (
        [...data.adminAuditLogs].reverse().map((log) => (
          <details key={log._id}>
            <summary>
              {log.action} · {log.targetId} · {log.reason}
            </summary>
            <p className="small muted">
              By {log.adminId} ·{" "}
              {new Date(log.createdAt).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
              })}{" "}
              IST
            </p>
            <pre className="audit-json">
              {JSON.stringify(
                { before: log.before, after: log.after },
                null,
                2,
              )}
            </pre>
          </details>
        ))
      ) : (
        <p className="small muted">No changes made in this session.</p>
      )}
    </section>
  );
}
