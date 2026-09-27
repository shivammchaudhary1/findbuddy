"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Crown, ArrowUpRight } from "lucide-react";
import { useDemo } from "@/hooks/demo-provider";
import { Avatar } from "@/components/ui/avatar";
import { isPro } from "@findbuddy/utils";
export function AccountShell({ children }: { children: ReactNode }) {
  const { data } = useDemo();
  const pathname = usePathname();
  const profile = data.profiles.find(
    (p) => p.userId === data.currentUser.userId,
  );
  const pro = isPro(
    data.subscriptions.find((s) => s.userId === data.currentUser.userId),
  );
  return (
    <div className="container page account-layout">
      <aside className="account-sidebar">
        <div className="row">
          <Avatar name={profile?.name ?? "Member"} src={profile?.image} />
          <div>
            <strong>{profile?.name}</strong>
            <p className="muted small">{pro ? "Pro member" : "Free member"}</p>
          </div>
        </div>
        <nav aria-label="Account navigation">
          {data.navigation.account.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={pathname === l.href ? "page" : undefined}
            >
              {l.label}
              <ArrowUpRight size={15} />
            </Link>
          ))}
        </nav>
        <Link href="/profile/subscription" className="account-pro">
          <Crown size={21} />
          <strong>FindBuddy Pro</strong>
          <p className="muted small">More ways to connect.</p>
        </Link>
      </aside>
      <div className="account-content">{children}</div>
    </div>
  );
}
