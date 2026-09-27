export const metadata = { title: "Plan details | FindBuddy" };
import { PlanDetail } from "@/features/plans/plan-detail";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <PlanDetail id={(await params).id} />;
}
