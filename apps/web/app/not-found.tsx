import { EmptyState } from "@/components/feedback/empty-state";
import { ButtonLink } from "@/components/ui/button";
export default function NotFound() {
  return (
    <main id="main-content" className="container page">
      <EmptyState
        as="h1"
        title="This page wandered off"
        description="The profile, activity, or page you're looking for isn't available."
        action={<ButtonLink href="/explore">Explore activities</ButtonLink>}
      />
    </main>
  );
}
