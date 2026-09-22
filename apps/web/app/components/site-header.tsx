"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/practice", label: "Practice" },
  { href: "/streak", label: "Streak" },
  { href: "/feed", label: "Feed" },
  { href: "/you", label: "You" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: "rgba(245,234,216,0.92)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--color-divider)",
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/"
          className="brand-link"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontFamily: "var(--font-heading)",
            fontSize: 22,
          }}
        >
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              background: "var(--color-accent-500)",
              display: "inline-block",
              boxShadow: "inset -6px -6px 0 0 var(--color-accent-2-500)",
            }}
          />
          Still Hour
        </Link>
        <nav style={{ marginLeft: "auto", display: "flex", gap: 6, flexWrap: "wrap" }}>
          {NAV_ITEMS.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className="nav-pill" data-active={active}>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
