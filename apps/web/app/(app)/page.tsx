import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px 96px" }}>
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.15fr) minmax(0, 0.85fr)",
          gap: 48,
          alignItems: "center",
          padding: "72px 0 64px",
        }}
        className="hero-grid"
      >
        <div>
          <span className="tag tag-accent-2">A community of daily sitters</span>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 400,
              fontSize: "clamp(44px, 6vw, 76px)",
              lineHeight: 1.02,
              margin: "20px 0 0",
              textWrap: "pretty",
            }}
          >
            Sit today.
            <br />
            Then sit tomorrow.
          </h1>
          <p
            style={{
              fontSize: 19,
              lineHeight: 1.6,
              maxWidth: "46ch",
              margin: "22px 0 0",
              color: "var(--color-neutral-800)",
            }}
          >
            Still Hour is a place to build the habit, not to shop for guided tracks. Start the
            timer, log the sit, watch the streak grow, and share what you are reading with
            everyone else who showed up today.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 32 }}>
            <Link className="btn btn-primary" href="/practice">
              Start a sit
            </Link>
            <Link className="btn btn-secondary" href="/streak">
              See the streak
            </Link>
          </div>
          <p style={{ marginTop: 20, fontSize: 14, color: "var(--color-neutral-700)" }}>
            Free to use. Beginners and long-timers, secular or Buddhist-rooted — all the same
            cushion.
          </p>
        </div>
        <div style={{ position: "relative", display: "grid", placeItems: "center", minHeight: 340 }}>
          <div
            style={{
              width: 290,
              height: 290,
              borderRadius: 999,
              background: "var(--color-accent-2-200)",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 210,
              height: 210,
              borderRadius: 999,
              background: "var(--color-accent-300)",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 120,
              height: 120,
              borderRadius: 999,
              background: "var(--color-accent-500)",
              boxShadow: "var(--shadow-md)",
            }}
          />
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 20,
        }}
      >
        <div className="card">
          <div className="card-kicker">One</div>
          <div className="card-title">A timer, nothing else</div>
          <p className="card-body">Pick a length or sit open-ended. A soft bell, no voice, no recommendations.</p>
        </div>
        <div className="card">
          <div className="card-kicker">Two</div>
          <div className="card-title">A streak you can see</div>
          <p className="card-body">Every sit fills a square. Missing a day is fine; the grid just waits for you.</p>
        </div>
        <div className="card">
          <div className="card-kicker">Three</div>
          <div className="card-title">A feed of what we read</div>
          <p className="card-body">Members post articles, talks and passages. No algorithm, just the order they arrived.</p>
        </div>
      </section>

      <section
        style={{
          marginTop: 72,
          background: "var(--color-accent-2-200)",
          borderRadius: "var(--radius-lg)",
          padding: 48,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 32,
        }}
      >
        <StatBlock value="1,240" label="sits logged this month" />
        <StatBlock value="312" label="people sitting regularly" />
        <StatBlock value="11 min" label="median session length" />
      </section>

      <section
        style={{
          marginTop: 72,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          gap: 48,
          alignItems: "start",
        }}
        className="sticks-grid"
      >
        <div>
          <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 400, fontSize: 38, margin: 0 }}>
            How the habit sticks
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.65, color: "var(--color-neutral-800)", maxWidth: "44ch" }}>
            The people who keep practising are rarely the ones who sit longest. They are the ones
            who sit again. Still Hour is built around that: a short daily target you set yourself,
            a record that is easy to keep, and other people who notice when you turn up.
          </p>
          <p style={{ fontSize: 17, lineHeight: 1.65, color: "var(--color-neutral-800)", maxWidth: "44ch" }}>
            Two minutes counts. So does twenty.
          </p>
        </div>
        <div style={{ display: "grid", gap: 14 }}>
          <StepRow n={1} title="Set your daily minimum." sub="Five minutes is a good place to start." />
          <StepRow n={2} title="Sit at the same hour." sub="Most of us go early, before the day starts asking." />
          <StepRow n={3} title="Log it before you get up." sub="One tap. The square fills in." />
        </div>
      </section>
    </main>
  );
}

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--font-heading)", fontSize: 48, lineHeight: 1 }}>{value}</div>
      <div style={{ marginTop: 8, color: "var(--color-accent-2-800)", fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function StepRow({ n, title, sub }: { n: number; title: string; sub: string }) {
  return (
    <div className="card elev-sm" style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
      <span
        style={{
          width: 44,
          height: 44,
          flex: "none",
          borderRadius: 999,
          background: "var(--color-accent-200)",
          display: "grid",
          placeItems: "center",
          fontFamily: "var(--font-heading)",
          color: "var(--color-accent-800)",
        }}
      >
        {n}
      </span>
      <div>
        <strong>{title}</strong>
        <div style={{ color: "var(--color-neutral-700)", fontSize: 15 }}>{sub}</div>
      </div>
    </div>
  );
}
