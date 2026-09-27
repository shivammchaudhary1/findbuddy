import { PlansList } from "@/features/plans/plans-list";
export const metadata = { title: "My plans | FindBuddy" };
export default function Page() {
  return <PlansList initialTab="Created by me" />;
}
