export const metadata = { title: "Activity details | FindBuddy" };
import { ServiceDetail } from "@/features/services/service-detail";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ServiceDetail id={id} />;
}
