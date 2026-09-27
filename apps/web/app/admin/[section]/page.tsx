import { AdminModule } from "@/features/admin/admin-module";
import { getWebsiteData } from "@/lib/data";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  return {
    title: `${getWebsiteData().navigation.admin.find((n) => n.href === `/admin/${section}`)?.label ?? "Admin"} | FindBuddy`,
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  return <AdminModule key={section} section={section} />;
}
