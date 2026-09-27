"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Search, MessageCircle, UserRound } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";

export function Header({
  links,
}: {
  links: { label: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  return (
    <header
      className="site-header"
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          setOpen(false);
          menuButton.current?.focus();
        }
      }}
    >
      <div className="container header-inner">
        <Logo />
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link
            href="/explore"
            className="icon-button"
            aria-label="Search activities"
          >
            <Search size={19} />
          </Link>
          <Link
            href="/messages"
            className="icon-button optional-nav"
            aria-label="Messages"
          >
            <MessageCircle size={19} />
          </Link>
          <Link className="login-link" href="/login">
            Log in
          </Link>
          <Link href="/profile" className="icon-button" aria-label="My account">
            <UserRound size={19} />
          </Link>
          <span className="desktop-cta">
            <ButtonLink href="/register" small>
              Get started
            </ButtonLink>
          </span>
          <button
            ref={menuButton}
            className="icon-button menu-toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <nav
            id="mobile-menu"
            className="mobile-menu"
            aria-label="Mobile navigation"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/profile" onClick={() => setOpen(false)}>
              <UserRound size={18} /> My profile
            </Link>
            <Link href="/messages" onClick={() => setOpen(false)}>
              Messages
            </Link>
            <Link href="/register" onClick={() => setOpen(false)}>
              Get started
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
