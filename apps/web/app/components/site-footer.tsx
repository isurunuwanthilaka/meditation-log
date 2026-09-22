import { signOut } from "@/app/login/actions";

export function SiteFooter() {
  return (
    <footer style={{ borderTop: "1px solid var(--color-divider)", padding: "32px 24px" }}>
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
          alignItems: "center",
          color: "var(--color-neutral-700)",
          fontSize: 14,
        }}
      >
        <span style={{ fontFamily: "var(--font-heading)", fontSize: 18, color: "var(--color-text)" }}>
          Still Hour
        </span>
        <span>A community of people keeping a daily practice.</span>
        <a href="#" style={{ marginLeft: "auto" }}>
          Guidelines
        </a>
        <a href="#">Contact</a>
        <form action={signOut}>
          <button
            type="submit"
            style={{
              background: "none",
              border: "none",
              padding: 0,
              font: "inherit",
              color: "var(--color-accent-700)",
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </form>
      </div>
    </footer>
  );
}
