import { AdminUserDetail } from "@/features/admin/user-detail";
export const metadata = { title: "User review | FindBuddy" };
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminUserDetail id={id} />;
}
