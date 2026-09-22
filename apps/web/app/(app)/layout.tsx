import type { ReactNode } from "react";
import { SiteHeader } from "@/app/components/site-header";
import { SiteFooter } from "@/app/components/site-footer";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--color-bg)",
        fontFamily: "var(--font-body)",
        color: "var(--color-text)",
      }}
    >
      <SiteHeader />
      <div style={{ flex: 1 }}>{children}</div>
      <SiteFooter />
    </div>
  );
}
