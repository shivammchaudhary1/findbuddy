"use client";
import { useDemo } from "@/hooks/demo-provider";
import { canViewProfile } from "@/lib/data/visibility";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Users,
  CalendarDays,
  Compass,
  Crown,
  Check,
} from "lucide-react";

import { filterServices } from "@/lib/data/services";

import { getProfile } from "@/lib/data/users";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeader } from "@/components/layout/section-header";
import { BuddyCard } from "@/components/cards/buddy-card";
import { PlanCard } from "@/components/cards/plan-card";
import { currency } from "@findbuddy/utils";

export function Home() {
  const { data } = useDemo();
  const { site, categories } = data;
  const services = filterServices(data);
  const buddies = data.profiles
    .filter((p) => services.some((s) => s.providerId === p.userId))
    .slice(0, 4);
  const plans = data.plans
    .filter(
      (p) =>
        p.status === "PUBLISHED" &&
        new Date(p.date) >= new Date() &&
        canViewProfile(data, p.creatorId),
    )
    .slice(0, 4);
  return (
    <main id="main-content">
      <section className="hero">
        <Image
          src={site.heroImage}
          alt={site.heroImageAlt}
          fill
          sizes="100vw"
          preload
        />
        <div className="hero-shade" />
        <div className="container hero-content">
          <p className="eyebrow">{site.home.heroEyebrow}</p>
          <h1>
            {site.home.heroLead}
            <br />
            {site.home.heroTail} <span>{site.home.heroAccent}</span>
          </h1>
          <p className="hero-description">{site.heroDescription}</p>
          <div className="row">
            <ButtonLink href="/explore">
              Find a buddy <ArrowRight size={18} />
            </ButtonLink>
            <ButtonLink href="/plans" variant="secondary">
              Explore plans
            </ButtonLink>
          </div>
          <div className="hero-note">
            <span className="hero-note-icon">
              <Users size={18} />
            </span>
            <p>
              {site.home.heroNote}
              <br />
              <span className="muted">{site.home.heroNoteSub}</span>
            </p>
          </div>
        </div>
      </section>
      <div className="container">
        <div className="value-strip">
          {[ShieldCheck, Users, Compass, CalendarDays].map((Icon, i) => (
            <div key={site.home.valueItems[i].title}>
              <Icon />
              <span>
                {site.home.valueItems[i].title}
                <small>{site.home.valueItems[i].description}</small>
              </span>
            </div>
          ))}
        </div>
        <section className="home-section">
          <SectionHeader
            title={site.home.activitiesTitle}
            description={site.home.activitiesDescription}
            action={
              <Link className="text-link" href="/services">
                All activities <ArrowRight size={16} />
              </Link>
            }
          />
          <div className="activity-grid">
            {categories.slice(0, 6).map((c) => (
              <Link
                href={`/explore?category=${c.id}`}
                className="activity-card"
                key={c.id}
              >
                <Image
                  src={c.image}
                  alt={c.name}
                  fill
                  sizes="(max-width:640px) 45vw, 16vw"
                />
                <span>
                  {c.name}
                  <ArrowUp />
                </span>
              </Link>
            ))}
          </div>
        </section>
        <section className="home-section">
          <SectionHeader
            title={site.home.buddiesTitle}
            description={site.home.buddiesDescription}
            action={
              <Link className="text-link" href="/explore">
                Explore buddies <ArrowRight size={16} />
              </Link>
            }
          />
          <div className="buddy-grid">
            {buddies.map((p) => (
              <BuddyCard
                key={p.userId}
                profile={p}
                service={services.find((s) => s.providerId === p.userId)}
              />
            ))}
          </div>
        </section>
        <section className="home-section">
          <SectionHeader
            title={site.home.plansTitle}
            description={site.home.plansDescription}
            action={
              <Link href="/plans" className="text-link">
                All plans <ArrowRight size={16} />
              </Link>
            }
          />
          <div className="grid-2">
            {plans.map((p) => (
              <PlanCard
                key={p._id}
                plan={p}
                host={getProfile(p.creatorId, data)?.name ?? "Host unavailable"}
                participants={
                  data.planJoinRequests.filter(
                    (r) => r.planId === p._id && r.status === "ACCEPTED",
                  ).length + 1
                }
              />
            ))}
          </div>
        </section>
        <section id="safety" className="home-section safety-panel">
          <div className="safety-icon">
            <ShieldCheck size={44} />
          </div>
          <div>
            <p className="eyebrow">{site.home.safetyEyebrow}</p>
            <h2>{site.home.safetyTitle}</h2>
            <p className="muted">{site.home.safetyDescription}</p>
            <p className="small muted">{site.safetyNote}</p>
          </div>
          <ButtonLink variant="secondary" href="/explore">
            Explore buddies <ArrowRight size={16} />
          </ButtonLink>
        </section>
        <section id="how-it-works" className="home-section">
          <SectionHeader
            title={site.home.howTitle}
            description={site.home.howDescription}
          />
          <div className="grid-3 how-grid">
            {site.howItWorks.map((step, i) => (
              <div key={step.title}>
                <span className="step-number">0{i + 1}</span>
                <h3>{step.title}</h3>
                <p className="muted">{step.description}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="home-section pro-panel">
          <div>
            <span className="eyebrow row">
              <Crown size={20} /> FindBuddy Pro
            </span>
            <h2>
              {site.home.proTitle}
              <br />
              {site.home.proSubtitle}
            </h2>
            <p className="muted">{site.home.proDescription}</p>
            <p className="pro-price">
              {currency(site.proPrice)}
              <span className="muted"> / month</span>
            </p>
            <ButtonLink href="/profile/subscription">
              Explore Pro <ArrowRight size={17} />
            </ButtonLink>
          </div>
          <ul className="pro-benefits">
            {site.proBenefits.slice(0, 8).map((b) => (
              <li key={b}>
                <Check size={17} />
                {b}
              </li>
            ))}
          </ul>
        </section>
        <section className="final-cta">
          <p className="eyebrow">{site.home.ctaEyebrow}</p>
          <h2>
            {site.home.ctaTitle}
            <br />
            {site.home.ctaSubtitle}
          </h2>
          <ButtonLink href="/register">
            Find your people <ArrowRight size={18} />
          </ButtonLink>
        </section>
      </div>
    </main>
  );
}
function ArrowUp() {
  return <ArrowRight size={17} />;
}
