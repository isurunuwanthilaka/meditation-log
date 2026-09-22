"use client";

import { useEffect, useState } from "react";
import type { FeedPost } from "@meditation-log/shared";
import { useOwnerId } from "@/lib/use-owner-id";
import { relativeTime } from "@/lib/relative-time";

export function FeedClient() {
  const ownerId = useOwnerId();
  const [feed, setFeed] = useState<FeedPost[]>([]);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftLink, setDraftLink] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!ownerId) return;
    void loadFeed(ownerId);
  }, [ownerId]);

  async function loadFeed(currentOwnerId: string) {
    const response = await fetch("/api/feed", { cache: "no-store", headers: { "x-owner-id": currentOwnerId } });
    const data = await response.json();
    setFeed(data.posts ?? []);
  }

  async function post() {
    const title = draftTitle.trim();
    if (!title || !ownerId) return;

    setPosting(true);
    const response = await fetch("/api/feed", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-owner-id": ownerId },
      body: JSON.stringify({ title, link: draftLink }),
    });

    if (response.ok) {
      setDraftTitle("");
      setDraftLink("");
      await loadFeed(ownerId);
    }
    setPosting(false);
  }

  async function toggleBow(id: string) {
    if (!ownerId) return;
    setFeed((prev) =>
      prev.map((post) =>
        post.id === id ? { ...post, bowed: !post.bowed, bows: post.bows + (post.bowed ? -1 : 1) } : post,
      ),
    );
    await fetch(`/api/feed/${id}/bow`, { method: "POST", headers: { "x-owner-id": ownerId } });
  }

  const postHint = draftTitle.trim() ? "Goes out to everyone sitting this week." : "Add a title to post.";

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "56px 24px 96px" }}>
      <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 400, fontSize: 44, margin: "0 0 8px" }}>
        Community feed
      </h1>
      <p style={{ color: "var(--color-neutral-700)", margin: "0 0 32px" }}>
        Send an article, a talk or a passage to everyone sitting this week.
      </p>

      <div
        style={{
          background: "var(--color-neutral-100)",
          borderRadius: "var(--radius-lg)",
          padding: 24,
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div className="field">
          <label htmlFor="feed-title">What are you sharing?</label>
          <input
            className="input"
            id="feed-title"
            placeholder="Title or a line about it"
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
          />
        </div>
        <div className="field" style={{ marginTop: 12 }}>
          <label htmlFor="feed-link">Link (optional)</label>
          <input
            className="input"
            id="feed-link"
            placeholder="https://"
            value={draftLink}
            onChange={(event) => setDraftLink(event.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 16 }}>
          <button type="button" className="btn btn-primary" disabled={posting} onClick={() => void post()}>
            Post to the feed
          </button>
          <span style={{ color: "var(--color-neutral-700)", fontSize: 14 }}>{postHint}</span>
        </div>
      </div>

      <div style={{ display: "grid", gap: 14, marginTop: 28 }}>
        {feed.map((item) => (
          <article className="card" key={item.id}>
            <div className="card-kicker">
              {item.authorName} · {relativeTime(item.createdAt)}
            </div>
            <div className="card-title">{item.title}</div>
            <p className="card-body">{item.note}</p>
            <div className="card-meta">
              <button type="button" className="btn btn-ghost" onClick={() => void toggleBow(item.id)}>
                {item.bows} bows
              </button>
              <span className="tag tag-outline">{item.tag}</span>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
