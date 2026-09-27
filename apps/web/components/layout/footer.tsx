import Link from "next/link";
import { Logo } from "@/components/brand/logo";
export function Footer({
  business,
  tagline,
}: {
  business: string;
  tagline: string;
}) {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="stack">
          <Logo />
          <p className="muted small">{tagline}</p>
          <p className="muted small">A platform by {business}.</p>
        </div>
        <nav className="footer-links" aria-label="Footer navigation">
          <Link href="/explore">Find a buddy</Link>
          <Link href="/profile/services">Become a buddy</Link>
          <Link href="/plans">Explore plans</Link>
          <Link href="/profile/subscription">FindBuddy Pro</Link>
          <Link href="/#safety">Trust & safety</Link>
        </nav>
      </div>
    </footer>
  );
}
