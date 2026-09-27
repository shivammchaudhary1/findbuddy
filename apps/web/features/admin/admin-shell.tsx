"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { useDemo } from "@/hooks/demo-provider";
import { Button } from "@/components/ui/button";
import { hasAdminAccess } from "./moderation";
export function AdminShell({ children }: { children: ReactNode }) {
  const { data, adminId, setAdminId } = useDemo();
  const pathname = usePathname();
  const sampleAdmin = data.users.find(
    (u) => u.accountRole === "ADMIN" && u.accountStatus === "ACTIVE",
  );
  if (!hasAdminAccess(data, adminId))
    return (
      <main id="main-content" className="container page stack">
        <ShieldCheck size={36} />
        <p className="eyebrow">FindBuddy moderation</p>
        <h1>Admin preview</h1>
        <p className="muted">
          The sample member account has no admin access. Open the separate
          sample-admin workspace to review the frontend moderation flows.
        </p>
        <p className="muted">
          This is a public demonstration, not an authenticated admin system.
          Every change resets on reload.
        </p>
        <div>
          <Button
            disabled={!sampleAdmin}
            onClick={() => setAdminId(sampleAdmin?._id ?? null)}
          >
            Open sample admin
          </Button>
        </div>
      </main>
    );
  return (
    <div className="container page account-layout">
      <aside className="account-sidebar">
        <Link href="/admin" className="row">
          <ShieldCheck />
          <strong>Admin workspace</strong>
        </Link>
        <p className="small muted">Sample admin · Session only</p>
        <nav aria-label="Admin navigation">
          {data.navigation.admin.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={pathname.startsWith(l.href) ? "page" : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Button variant="secondary" small onClick={() => setAdminId(null)}>
          Leave admin preview
        </Button>
      </aside>
      <div className="account-content">{children}</div>
    </div>
  );
}
