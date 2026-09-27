"use client";
import { Button, ButtonLink } from "@/components/ui/button";
export default function ErrorPage({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main id="main-content" className="container page stack">
      <p className="eyebrow">Let&apos;s try that again</p>
      <h1>Something didn&apos;t load</h1>
      <p className="muted">
        We couldn&apos;t display this page. Try again, or head back to Explore.
      </p>
      <div className="row">
        <Button onClick={retry}>Try again</Button>
        <ButtonLink href="/explore" variant="secondary">
          Explore activities
        </ButtonLink>
      </div>
    </main>
  );
}
