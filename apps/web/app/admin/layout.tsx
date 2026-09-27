import type { ReactNode } from "react";
import { AdminShell } from "@/features/admin/admin-shell";
export const metadata = {
  title: "Admin | FindBuddy",
  robots: { index: false, follow: false },
};
export default function Layout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
