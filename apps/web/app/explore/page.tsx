import type { Metadata } from "next";
import { Explore } from "@/features/discovery/explore";

export const metadata: Metadata = { title: "Explore buddies | FindBuddy" };
export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  return <Explore initialCategory={category} />;
}
