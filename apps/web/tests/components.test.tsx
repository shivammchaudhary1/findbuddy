import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getWebsiteData } from "@/lib/data";
import { DemoProvider } from "@/hooks/demo-provider";
import { SubscriptionPage } from "@/features/profile/subscription";
import { BuddyCard } from "@/components/cards/buddy-card";
import { ServiceCard } from "@/components/cards/service-card";
import { PlanCard } from "@/components/cards/plan-card";
import { TrustScore } from "@/features/trust/trust-score";
import { EmptyState } from "@/components/feedback/empty-state";
import { Explore } from "@/features/discovery/explore";
import { PageSkeleton } from "@/components/feedback/page-skeleton";
import ErrorPage from "@/app/error";
const data = getWebsiteData();
describe("component contracts", () => {
  it("exposes loading status and a recoverable error state", () => {
    expect(renderToStaticMarkup(<PageSkeleton />)).toContain(
      'aria-busy="true"',
    );
    const html = renderToStaticMarkup(
      <ErrorPage error={new Error("Test")} retry={() => {}} />,
    );
    expect(html).toContain("Try again");
    expect(html).toContain('href="/explore"');
    expect(html).not.toContain("Test");
  });
  it("separates the buddy profile from its priced activity", () => {
    const html = renderToStaticMarkup(
      <BuddyCard profile={data.profiles[0]} service={data.services[0]} />,
    );
    expect(html).toContain("/buddies/riya");
    expect(html).toContain("/services/coffee-riya");
    expect(html).toContain("₹300 per activity");
    expect(
      renderToStaticMarkup(<BuddyCard profile={data.profiles[0]} />),
    ).not.toContain("per activity");
  });
  it("renders free service and plan fees with actionable destinations", () => {
    expect(
      renderToStaticMarkup(
        <ServiceCard
          service={data.services.find((s) => s.pricingType === "FREE")!}
        />,
      ),
    ).toContain("Free activity");
    const html = renderToStaticMarkup(
      <PlanCard
        plan={data.plans[0]}
        host={data.profiles[0].name}
        participants={2}
      />,
    );
    expect(html).toContain("Free plan");
    expect(html).toContain("/plans/weekend-coffee");
  });
  it("trust remains advisory and supports unavailable data", () => {
    expect(renderToStaticMarkup(<TrustScore />)).toContain("Unavailable");
    const html = renderToStaticMarkup(
      <TrustScore trust={data.trustScores[0]} detailed />,
    );
    expect(html).toContain("87/100");
    expect(html).toContain("do not guarantee safety");
    expect(html).toContain(data.trustScores[0].reasons[0]);
    expect(
      renderToStaticMarkup(
        <EmptyState title="No results" description="Change your filters." />,
      ),
    ).toContain("No results");
  });
  it("renders different Free and active Pro entitlements without granting verification", () => {
    const free = renderToStaticMarkup(
      <DemoProvider initialData={data}>
        <SubscriptionPage />
      </DemoProvider>,
    );
    const proData = { ...data, currentUser: { userId: "riya" } };
    const pro = renderToStaticMarkup(
      <DemoProvider initialData={proData}>
        <SubscriptionPage />
      </DemoProvider>,
    );
    expect(free).toContain("Free member");
    expect(free).toContain("Upgrade unavailable");
    expect(pro).toContain("Pro member");
    expect(pro).toContain("Subscription management unavailable");
    expect(
      renderToStaticMarkup(
        <DemoProvider initialData={data}>
          <Explore />
        </DemoProvider>,
      ),
    ).toContain("<fieldset disabled");
    expect(
      renderToStaticMarkup(
        <DemoProvider initialData={proData}>
          <Explore />
        </DemoProvider>,
      ),
    ).not.toContain("<fieldset disabled");
  });
});
