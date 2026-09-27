import type { ReactNode } from "react";
import { AccountShell } from "@/features/profile/account-shell";
export default function Layout({ children }: { children: ReactNode }) {
  return <AccountShell>{children}</AccountShell>;
}
