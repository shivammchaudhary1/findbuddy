"use client";
import { useDemo } from "@/hooks/demo-provider";
import { filterServices } from "@/lib/data/services";
import { ServiceCard } from "@/components/cards/service-card";
import { EmptyState } from "@/components/feedback/empty-state";
export function ServicesList() {
  const { data } = useDemo();
  const services = filterServices(data);
  return (
    <main id="main-content" className="container page stack">
      <p className="eyebrow">Something better, together</p>
      <h1>Buddy activities</h1>
      <p className="muted">Find good company for the things you enjoy.</p>
      {services.length ? (
        <div className="grid-2">
          {services.map((s) => (
            <ServiceCard key={s._id} service={s} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No activities available"
          description="Check back for new activities."
        />
      )}
    </main>
  );
}
