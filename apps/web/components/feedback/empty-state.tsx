import { Compass } from "lucide-react";
import type { ReactNode } from "react";
export function EmptyState({
  title,
  description,
  action,
  as: Heading = "h2",
}: {
  title: string;
  description: string;
  action?: ReactNode;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <div className="empty-state">
      <Compass size={32} />
      <Heading>{title}</Heading>
      <p className="muted">{description}</p>
      {action}
    </div>
  );
}
