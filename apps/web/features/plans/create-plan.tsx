"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { planSchema } from "@findbuddy/validation";
import { useDemo } from "@/hooks/demo-provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
export function CreatePlan() {
  const { data, setData } = useDemo();
  const router = useRouter();
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      data.users.find((u) => u._id === data.currentUser.userId)
        ?.accountStatus !== "ACTIVE"
    ) {
      setError("Your account cannot create plans while suspended or blocked.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const date = new Date(`${form.get("date")}T${form.get("time")}:00+05:30`);
    if (!Number.isFinite(date.getTime()) || date <= new Date()) {
      setError("Choose a future date and time.");
      return;
    }
    const result = planSchema.safeParse({
      _id: `plan-${crypto.randomUUID()}`,
      creatorId: data.currentUser.userId,
      title: form.get("title"),
      description: form.get("description"),
      date: date.toISOString(),
      locationText: form.get("location"),
      city: form.get("city"),
      peopleRequired: Number(form.get("people")),
      pricingType: paid ? "PAID" : "FREE",
      price: paid ? Number(form.get("price")) : 0,
      image: data.site.heroImage,
      status: "PUBLISHED",
    });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setData((previous) => ({
      ...previous,
      plans: [result.data, ...previous.plans],
    }));
    router.push(`/plans/${result.data._id}`);
  }
  return (
    <main id="main-content" className="container page">
      <div className="form-container stack">
        <Link href="/plans" className="text-link">
          <ArrowLeft size={16} /> Back to plans
        </Link>
        <p className="eyebrow">Make something happen</p>
        <h1>Create a plan</h1>
        <p className="muted">
          A coffee, a movie, a weekend adventure. Good company starts with an
          invitation.
        </p>
        <form className="card card-padding stack" onSubmit={submit}>
          <Input
            label="Plan title"
            id="plan-title"
            name="title"
            required
            minLength={3}
            maxLength={120}
            placeholder="Weekend coffee meet"
          />
          <label className="field">
            Description
            <textarea
              className="input"
              name="description"
              required
              maxLength={2000}
              placeholder="Tell people what you have in mind…"
            />
          </label>
          <div className="grid-2">
            <Input
              label="Date"
              id="plan-date"
              name="date"
              type="date"
              required
            />
            <Input
              label="Time (India)"
              id="plan-time"
              name="time"
              type="time"
              required
            />
          </div>
          <Input
            label="Meeting location"
            id="plan-location"
            name="location"
            required
            placeholder="A public place, neighbourhood, or venue"
          />
          <div className="grid-2">
            <Input
              label="City"
              id="plan-city"
              name="city"
              required
              defaultValue={data.site.city}
            />
            <Input
              label="People required"
              id="plan-people"
              name="people"
              type="number"
              required
              min={2}
              max={100}
              defaultValue={4}
            />
          </div>
          <fieldset className="plan-pricing">
            <legend>Plan fee</legend>
            <label className="checkbox-row">
              <input
                type="radio"
                name="pricing"
                checked={!paid}
                onChange={() => setPaid(false)}
              />{" "}
              Free plan
            </label>
            <label className="checkbox-row">
              <input
                type="radio"
                name="pricing"
                checked={paid}
                onChange={() => setPaid(true)}
              />{" "}
              Paid plan
            </label>
          </fieldset>
          {paid && (
            <Input
              id="plan-price"
              label="Activity fee (₹)"
              name="price"
              type="number"
              required
              min={1}
              step="1"
            />
          )}
          {error && (
            <p className="form-message" role="alert">
              {error}
            </p>
          )}
          <Button type="submit">
            <CalendarDays size={17} /> Create plan
          </Button>
          <p className="small muted">
            Preview only. Your plan stays in this session and resets on reload.
            No payment is collected.
          </p>
        </form>
      </div>
    </main>
  );
}
