import { Card } from "@/components/ui/card";
export function PageSkeleton() {
  return (
    <main
      id="main-content"
      className="container page stack"
      aria-busy="true"
      aria-label="Loading page"
    >
      <p role="status" className="muted">
        Loading your next connection…
      </p>
      <div className="skeleton skeleton-title" />
      <div className="grid-3">
        {[0, 1, 2].map((i) => (
          <Card key={i} className="card-padding stack" aria-hidden="true">
            <div className="skeleton skeleton-photo" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line" />
          </Card>
        ))}
      </div>
    </main>
  );
}
