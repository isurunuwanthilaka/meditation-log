import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guidelines — Still Hour",
  description: "How we keep the practice and the feed worth showing up for.",
};

const GUIDELINES = [
  {
    kicker: "One",
    title: "Log your own sits",
    body: "The streak and the feed only mean something if they are honest. Log the time you actually sat, not the time you meant to.",
  },
  {
    kicker: "Two",
    title: "Share what steadies you",
    body: "Articles, talks, passages — post things that helped your practice, not things you are promoting. No affiliate links, no course pitches.",
  },
  {
    kicker: "Three",
    title: "Skip the day, don't skip the kindness",
    body: "Missing a day is normal and nobody here is counting against you. Comments and bows are for encouragement, not for judging someone's gap.",
  },
  {
    kicker: "Four",
    title: "Keep it secular-friendly",
    body: "People sit here for all kinds of reasons — Buddhist-rooted, secular, borrowed from a dozen traditions. Share your own view without telling others theirs is wrong.",
  },
  {
    kicker: "Five",
    title: "No teaching, no selling",
    body: "This is a place to sit together, not a storefront. Don't use the feed to advertise retreats, apps, coaching, or anything with a price tag.",
  },
  {
    kicker: "Six",
    title: "Report, don't retaliate",
    body: "If a post or a member is out of line, flag it to us at the contact address in the footer. We would rather deal with it than watch a thread turn into an argument.",
  },
] as const;

export default function GuidelinesPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "56px 24px 96px" }}>
      <span className="tag tag-accent-2">Community guidelines</span>
      <h1
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 400,
          fontSize: "clamp(36px, 5vw, 52px)",
          lineHeight: 1.05,
          margin: "16px 0 0",
          textWrap: "pretty",
        }}
      >
        A few rules, kept short
      </h1>
      <p
        style={{
          fontSize: 17,
          lineHeight: 1.6,
          maxWidth: "58ch",
          margin: "16px 0 0",
          color: "var(--color-neutral-800)",
        }}
      >
        Still Hour works because the streaks are honest and the feed is quiet. These are the
        expectations for anyone sitting with us — short enough to actually read.
      </p>

      <div style={{ display: "grid", gap: 16, marginTop: 40 }}>
        {GUIDELINES.map((item) => (
          <div key={item.title} className="card elev-sm">
            <div className="card-kicker">{item.kicker}</div>
            <div className="card-title">{item.title}</div>
            <p className="card-body">{item.body}</p>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 48,
          padding: 24,
          borderRadius: "var(--radius-lg)",
          background: "var(--color-accent-2-200)",
        }}
      >
        <h2 style={{ fontSize: 20, margin: "0 0 8px" }}>Breaking these</h2>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "var(--color-neutral-800)" }}>
          We will remove posts that ignore this, and repeat offenders lose their feed access. Most
          people never run into this — it exists for the rare case, not to police the room.
        </p>
      </div>

      <p style={{ marginTop: 32, fontSize: 14, color: "var(--color-neutral-700)" }}>
        Questions about a specific post? Use the contact link in the footer below.
      </p>
    </main>
  );
}
