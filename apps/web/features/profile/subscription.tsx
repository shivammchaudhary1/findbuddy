"use client";
import { Crown, Check, ShieldCheck } from "lucide-react";
import { useDemo } from "@/hooks/demo-provider";
import { currency, isPro, dateLabel } from "@findbuddy/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
export function SubscriptionPage() {
  const { data } = useDemo();
  const subscription = data.subscriptions.find(
    (s) => s.userId === data.currentUser.userId,
  );
  const pro = isPro(subscription);
  const profile = data.profiles.find(
    (p) => p.userId === data.currentUser.userId,
  );
  return (
    <main id="main-content" className="stack">
      <p className="eyebrow">Open up more possibilities</p>
      <h1>Your membership</h1>
      <div className="row">
        <Badge tone="brand">{pro ? "Pro member" : "Free member"}</Badge>
        {subscription && (
          <span className="muted small">
            Period ends {dateLabel(subscription.currentPeriodEnd)}
          </span>
        )}
      </div>
      <section className="card card-padding stack membership-card">
        <Crown size={36} />
        <h2>FindBuddy Pro</h2>
        <p className="pro-price">
          {currency(data.site.proPrice)}
          <span> / month</span>
        </p>
        <p className="muted">
          More flexibility for your activities. More ways to make meaningful
          connections.
        </p>
        <ul className="pro-benefits">
          {data.site.proBenefits.map((b) => (
            <li key={b}>
              <Check size={18} />
              {b}
            </li>
          ))}
        </ul>
        <Button disabled>
          {pro
            ? "Subscription management unavailable in preview"
            : "Upgrade unavailable in preview"}
        </Button>
        <p className="muted small">
          Payments are not connected. No subscription will be created and no
          charge will be made.
        </p>
      </section>
      <section className="card card-padding stack">
        <h2 className="row">
          <ShieldCheck size={22} /> Identity verification
        </h2>
        <Badge tone="brand">
          {profile?.isIdentityVerified ? "Verified" : "Not verified"}
        </Badge>
        <p className="muted">
          {profile?.isIdentityVerified
            ? "Identity verification history remains separate from your membership entitlement."
            : pro
              ? "Your membership includes eligibility for Aadhaar-based verification."
              : "Pro membership includes eligibility for Aadhaar-based verification through an external provider."}
        </p>
        <Button variant="secondary" disabled>
          Verification unavailable in preview
        </Button>
        <p className="small muted">
          A verified badge is awarded after successful verification. Membership
          does not buy a Trust Score.
        </p>
      </section>
      <section className="card card-padding stack">
        <h2>Offering activities as a Free member</h2>
        <p className="muted">
          Offer free activities or set a fee up to ₹500 per activity. Per-hour
          pricing and fees above ₹500 require an active Pro membership.
        </p>
      </section>
    </main>
  );
}
