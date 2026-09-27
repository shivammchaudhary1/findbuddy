"use client";
import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { useDemo } from "@/hooks/demo-provider";
import { pricingError, isPro, feeLabel } from "@findbuddy/utils";
import { serviceSchema } from "@findbuddy/validation";
import type { BuddyService } from "@findbuddy/types";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/feedback/empty-state";
export function MyServices() {
  const { data, setData } = useDemo();
  const [editing, setEditing] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const userId = data.currentUser.userId;
  const services = data.services.filter(
    (s) => s.providerId === userId && s.status !== "REMOVED",
  );
  const current = services.find((s) => s._id === editing);
  const pro = isPro(data.subscriptions.find((s) => s.userId === userId));
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (data.users.find((u) => u._id === userId)?.accountStatus !== "ACTIVE") {
      setNotice(
        "Your account cannot publish activities while suspended or blocked.",
      );
      return;
    }
    const f = new FormData(event.currentTarget);
    const pricingType = String(
      f.get("pricingType"),
    ) as BuddyService["pricingType"];
    const price = Number(f.get("price"));
    const error = pricingError(pricingType, price, pro);
    if (error) {
      setNotice(error);
      return;
    }
    const category = data.categories.find((c) => c.id === f.get("category"));
    const start = String(f.get("start")),
      end = String(f.get("end"));
    if (start >= end) {
      setNotice("End time must be after start time.");
      return;
    }
    const result = serviceSchema.safeParse({
      _id: current?._id ?? `service-${crypto.randomUUID()}`,
      providerId: userId,
      category: category?.id,
      title: f.get("title"),
      description: f.get("description"),
      pricingType,
      price,
      city: f.get("city"),
      pincode: data.profiles.find((p) => p.userId === userId)?.pincode ?? "",
      locationText: f.get("location"),
      availability: [
        { dayOfWeek: Number(f.get("day")), startTime: start, endTime: end },
      ],
      status: "ACTIVE",
      image: category?.image,
    });
    if (!result.success) {
      setNotice(result.error.issues[0].message);
      return;
    }
    setData((previous) => ({
      ...previous,
      services: current
        ? previous.services.map((s) =>
            s._id === current._id ? result.data : s,
          )
        : [...previous.services, result.data],
    }));
    setNotice("Activity saved in this preview. Changes reset on reload.");
    setEditing(null);
  }
  return (
    <main id="main-content" className="stack">
      <div className="section-header">
        <div>
          <p className="eyebrow">Share what you love</p>
          <h1>My services</h1>
        </div>
        <Button
          onClick={() => {
            setEditing("new");
            setNotice("");
          }}
        >
          <Plus size={18} /> Add activity
        </Button>
      </div>
      <p className="muted">
        {pro
          ? "Your Pro membership supports hourly pricing and fees above ₹500."
          : "Free member: offer free activities or set a fee up to ₹500 per activity."}
      </p>
      {editing !== null && (
        <form key={editing} className="card card-padding stack" onSubmit={save}>
          <h2>{current ? "Edit activity" : "New activity"}</h2>
          <Input
            id="service-title"
            label="Activity title"
            name="title"
            required
            maxLength={120}
            defaultValue={current?.title}
          />
          <label className="field">
            Description
            <textarea
              className="input"
              name="description"
              required
              maxLength={2000}
              defaultValue={current?.description}
            />
          </label>
          <label className="field">
            Category
            <select
              className="input"
              name="category"
              defaultValue={current?.category}
            >
              {data.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <div className="grid-2">
            <label className="field">
              Pricing model
              <select
                className="input"
                name="pricingType"
                defaultValue={current?.pricingType ?? "PER_SESSION"}
              >
                <option value="FREE">Free</option>
                <option value="PER_SESSION">Per activity</option>
                <option value="PER_HOUR" disabled={!pro}>
                  Per hour (Pro)
                </option>
              </select>
            </label>
            <Input
              id="service-fee"
              label="Activity fee (₹)"
              type="number"
              min={0}
              step="1"
              name="price"
              required
              defaultValue={current?.price ?? 0}
            />
          </div>
          <Input
            id="service-city"
            label="City"
            name="city"
            defaultValue={current?.city ?? data.site.city}
            required
          />
          <Input
            id="service-location"
            label="Meeting area"
            name="location"
            defaultValue={current?.locationText}
            required
          />
          <label className="field">
            Available day
            <select
              className="input"
              name="day"
              defaultValue={current?.availability[0]?.dayOfWeek ?? 0}
            >
              {[
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ].map((d, i) => (
                <option key={d} value={i}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <div className="grid-2">
            <Input
              label="From (India)"
              id="service-start"
              type="time"
              name="start"
              required
              defaultValue={current?.availability[0]?.startTime}
            />
            <Input
              label="Until (India)"
              id="service-end"
              type="time"
              name="end"
              required
              defaultValue={current?.availability[0]?.endTime}
            />
          </div>
          <div className="row">
            <Button type="submit">Save activity preview</Button>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
      {notice && (
        <p role="status" className="form-message">
          {notice}
        </p>
      )}
      {services.length ? (
        services.map((s) => (
          <article className="card card-padding stack" key={s._id}>
            <div className="row between">
              <h2>{s.title}</h2>
              <Badge>{s.status.toLowerCase()}</Badge>
            </div>
            <p className="muted">{s.description}</p>
            <strong>{feeLabel(s)}</strong>
            <div className="row">
              <Button
                small
                variant="secondary"
                onClick={() => {
                  setEditing(s._id);
                  setNotice("");
                }}
              >
                Edit activity
              </Button>
              <Button
                small
                variant="secondary"
                onClick={() => {
                  if (
                    data.users.find((u) => u._id === userId)?.accountStatus !==
                    "ACTIVE"
                  ) {
                    setNotice(
                      "Your account cannot change listings while suspended or blocked.",
                    );
                    return;
                  }
                  const error = pricingError(s.pricingType, s.price, pro);
                  if (s.status !== "ACTIVE" && error) {
                    setNotice(error);
                    return;
                  }
                  setData((previous) => ({
                    ...previous,
                    services: previous.services.map((x) =>
                      x._id === s._id
                        ? {
                            ...x,
                            status: x.status === "ACTIVE" ? "PAUSED" : "ACTIVE",
                          }
                        : x,
                    ),
                  }));
                }}
              >
                {s.status === "ACTIVE" ? "Pause" : "Reactivate"}
              </Button>
              <ButtonLink small variant="ghost" href={`/services/${s._id}`}>
                View activity
              </ButtonLink>
            </div>
          </article>
        ))
      ) : (
        <EmptyState
          title="No services yet"
          description="Create an activity to share your interests with others."
        />
      )}
    </main>
  );
}
