"use client";

import { useEffect, useMemo, useState } from "react";
import type { MeditationLog, MemberSettingsInput } from "@meditation-log/shared";
import { useOwnerId } from "@/lib/use-owner-id";
import { computeStreaks, isWithinDays, median } from "@/lib/streak";

type ToggleKey = "reminderEnabled" | "shareEnabled" | "bellEnabled";

const TOGGLE_ROWS: { key: ToggleKey; title: string; description: string }[] = [
  { key: "reminderEnabled", title: "Daily reminder", description: "A nudge at your usual hour." },
  {
    key: "shareEnabled",
    title: "Share sits with the community",
    description: "Your streak shows on the feed. Session notes stay private.",
  },
  { key: "bellEnabled", title: "Ending bell", description: "Played once when the timer runs out." },
];

export function YouClient({
  memberName,
  initials,
  memberSince,
}: {
  memberName: string;
  initials: string;
  memberSince: string;
}) {
  const ownerId = useOwnerId();
  const [logs, setLogs] = useState<MeditationLog[]>([]);
  const [settings, setSettings] = useState<MemberSettingsInput | null>(null);

  useEffect(() => {
    if (!ownerId) return;
    void Promise.all([
      fetch("/api/logs", { cache: "no-store", headers: { "x-owner-id": ownerId } }).then((res) => res.json()),
      fetch("/api/settings", { cache: "no-store", headers: { "x-owner-id": ownerId } }).then((res) => res.json()),
    ]).then(([logsData, settingsData]) => {
      setLogs(logsData.logs ?? []);
      setSettings(settingsData.settings ?? null);
    });
  }, [ownerId]);

  async function toggle(key: ToggleKey) {
    if (!settings || !ownerId) return;
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-owner-id": ownerId },
      body: JSON.stringify(next),
    });
  }

  const goal = settings?.dailyGoalMinutes ?? 5;
  const { current } = useMemo(() => computeStreaks(logs, goal), [logs, goal]);
  const totalMinutes = useMemo(() => logs.reduce((sum, log) => sum + log.minutes, 0), [logs]);
  const weekLogs = useMemo(() => logs.filter((log) => isWithinDays(log.date, 7)), [logs]);
  const weekMinutes = useMemo(() => weekLogs.reduce((sum, log) => sum + log.minutes, 0), [weekLogs]);
  const medianMinutes = useMemo(() => median(logs.map((log) => log.minutes)), [logs]);

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "56px 24px 96px" }}>
      <div style={{ display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap" }}>
        <span
          style={{
            width: 108,
            height: 108,
            borderRadius: 999,
            background: "var(--color-accent-300)",
            display: "grid",
            placeItems: "center",
            fontFamily: "var(--font-heading)",
            fontSize: 40,
            color: "var(--color-accent-900)",
            flex: "none",
          }}
        >
          {initials}
        </span>
        <div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 400, fontSize: 42, margin: 0 }}>
            {memberName}
          </h1>
          <p style={{ margin: "6px 0 0", color: "var(--color-neutral-700)" }}>{memberSince}</p>
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <span className="tag tag-accent">{current} day streak</span>
            <span className="tag tag-accent-2">Morning sitter</span>
            <span className="tag tag-neutral">Secular &amp; Buddhist-rooted</span>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginTop: 40,
        }}
      >
        <div className="card">
          <div className="card-kicker">All time</div>
          <div className="card-title">{logs.length} sits</div>
          <p className="card-body">{totalMinutes} minutes on the cushion.</p>
        </div>
        <div className="card">
          <div className="card-kicker">This week</div>
          <div className="card-title">{weekMinutes} minutes</div>
          <p className="card-body">Across {weekLogs.length} sessions.</p>
        </div>
        <div className="card">
          <div className="card-kicker">Usual length</div>
          <div className="card-title">{medianMinutes} minutes</div>
          <p className="card-body">Your daily minimum is {goal} minutes.</p>
        </div>
      </div>

      <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 400, fontSize: 28, margin: "48px 0 16px" }}>
        Settings
      </h2>
      <div style={{ display: "grid", gap: 12 }}>
        {TOGGLE_ROWS.map((row) => (
          <div
            key={row.key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              background: "var(--color-neutral-100)",
              borderRadius: "var(--radius-md)",
              padding: "18px 22px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <strong>{row.title}</strong>
              <div style={{ color: "var(--color-neutral-700)", fontSize: 15 }}>{row.description}</div>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ marginLeft: "auto" }}
              onClick={() => void toggle(row.key)}
            >
              {settings?.[row.key] ? "On" : "Off"}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
