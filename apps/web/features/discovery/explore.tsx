"use client";
import { useDemo } from "@/hooks/demo-provider";
import { useState } from "react";
import { Search, SlidersHorizontal, Crown } from "lucide-react";
import type { ServiceFilters } from "@findbuddy/types";
import { filterServices } from "@/lib/data/services";
import { isPro } from "@findbuddy/utils";
import { BuddyCard } from "@/components/cards/buddy-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { FilterChip } from "@/components/ui/filter-chip";
import { EmptyState } from "@/components/feedback/empty-state";

export function Explore({
  initialCategory = "",
}: {
  initialCategory?: string;
}) {
  const { data } = useDemo();
  const [filters, setFilters] = useState<ServiceFilters>({
    category: initialCategory,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState("recommended");
  const pro = isPro(
    data.subscriptions.find((s) => s.userId === data.currentUser.userId),
  );
  const results = filterServices(data, filters).sort((a, b) =>
    sort === "price"
      ? a.price - b.price
      : (data.trustScores.find((t) => t.userId === b.providerId)?.finalScore ??
          0) -
        (data.trustScores.find((t) => t.userId === a.providerId)?.finalScore ??
          0),
  );
  function update<K extends keyof ServiceFilters>(
    key: K,
    value: ServiceFilters[K],
  ) {
    setFilters((previous) => ({ ...previous, [key]: value }));
  }
  return (
    <main id="main-content" className="container page">
      <div className="page-heading">
        <p className="eyebrow">Find your people</p>
        <h1>Explore buddies</h1>
        <p className="muted">Good company for whatever you love doing.</p>
      </div>
      <div className="discovery-toolbar">
        <label className="search-field">
          <Search size={19} />
          <input
            aria-label="Search activities or people"
            value={filters.search ?? ""}
            placeholder="Search people, activities, or interests…"
            onChange={(e) => update("search", e.target.value)}
          />
        </label>
        <Button
          variant="secondary"
          className="filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
          aria-expanded={showFilters}
          aria-controls="discovery-filters"
        >
          <SlidersHorizontal size={17} /> Filters
        </Button>
      </div>
      <div className="discovery-layout">
        <aside
          id="discovery-filters"
          className={`filter-panel ${showFilters ? "filters-open" : ""}`}
        >
          <div className="row between">
            <h2>Filters</h2>
            <button className="text-link" onClick={() => setFilters({})}>
              Clear all
            </button>
          </div>
          <label className="field">
            City
            <input
              className="input"
              placeholder="e.g. Mumbai"
              value={filters.city ?? ""}
              onChange={(e) => update("city", e.target.value)}
            />
          </label>
          <fieldset>
            <legend>Activity type</legend>
            <div className="row">
              <FilterChip
                active={!filters.category}
                onClick={() => update("category", "")}
              >
                All
              </FilterChip>
              {data.categories.map((c) => (
                <FilterChip
                  key={c.id}
                  active={filters.category === c.id}
                  onClick={() => update("category", c.id)}
                >
                  {c.name}
                </FilterChip>
              ))}
            </div>
          </fieldset>
          <label className="field">
            Maximum activity fee
            <select
              className="input"
              value={filters.maxPrice ?? ""}
              onChange={(e) =>
                update(
                  "maxPrice",
                  e.target.value === "" ? undefined : Number(e.target.value),
                )
              }
            >
              <option value="">Any fee</option>
              <option value="0">Free activities</option>
              <option value="300">Up to ₹300</option>
              <option value="500">Up to ₹500</option>
            </select>
          </label>
          <label className="field">
            Minimum rating
            <select
              className="input"
              value={filters.minRating ?? ""}
              onChange={(e) =>
                update(
                  "minRating",
                  e.target.value === "" ? undefined : Number(e.target.value),
                )
              }
            >
              <option value="">Any rating</option>
              <option value="4">4.0 and above</option>
              <option value="4.5">4.5 and above</option>
              <option value="4.8">4.8 and above</option>
            </select>
          </label>
          <label className="field">
            Availability
            <select
              className="input"
              value={filters.dayOfWeek ?? ""}
              onChange={(e) =>
                update(
                  "dayOfWeek",
                  e.target.value === "" ? undefined : Number(e.target.value),
                )
              }
            >
              <option value="">Any day</option>
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
          <fieldset disabled={!pro}>
            <legend className="row">
              Advanced filters <Crown size={15} />
            </legend>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={filters.verifiedOnly ?? false}
                onChange={(e) => update("verifiedOnly", e.target.checked)}
              />{" "}
              Verified only
            </label>
            <label className="field">
              Minimum Trust Score
              <select
                className="input"
                value={filters.minTrust ?? ""}
                onChange={(e) =>
                  update(
                    "minTrust",
                    e.target.value === "" ? undefined : Number(e.target.value),
                  )
                }
              >
                <option value="">Any score</option>
                <option value="75">75 and above</option>
                <option value="90">90 and above</option>
              </select>
            </label>
          </fieldset>
          {!pro && (
            <div className="filter-pro">
              <p className="small muted">
                Advanced filters are available with Pro.
              </p>
              <ButtonLink
                href="/profile/subscription"
                small
                variant="secondary"
              >
                Explore Pro
              </ButtonLink>
            </div>
          )}
        </aside>
        <section aria-label="Search results">
          <div className="results-heading">
            <p className="muted small" role="status">
              {results.length}{" "}
              {results.length === 1 ? "activity" : "activities"} found
            </p>
            <label className="row small">
              Sort by
              <select
                className="input sort-select"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="recommended">Recommended</option>
                <option value="price">Activity fee</option>
              </select>
            </label>
          </div>
          {results.length ? (
            <div className="explore-grid">
              {results.map((s) => {
                const profile = data.profiles.find(
                  (p) => p.userId === s.providerId,
                );
                return profile ? (
                  <BuddyCard key={s._id} profile={profile} service={s} />
                ) : null;
              })}
            </div>
          ) : (
            <EmptyState
              title="No services found"
              description="Try a different activity, city, or fee to find your next plan."
              action={
                <Button onClick={() => setFilters({})}>Clear filters</Button>
              }
            />
          )}
        </section>
      </div>
    </main>
  );
}
