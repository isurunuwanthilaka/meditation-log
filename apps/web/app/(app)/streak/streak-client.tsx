"use client";

import { useEffect, useMemo, useState } from "react";
import type { MeditationLog } from "@meditation-log/shared";
import { DailyGoalOptions } from "@meditation-log/shared";
import { useOwnerId } from "@/lib/use-owner-id";
import { computeGrid, computeStreaks } from "@/lib/streak";

function cellColor(minutes: number): string {
  if (minutes === 0) return "var(--color-neutral-200)";
  if (minutes < 8) return "var(--color-accent-2-300)";
  if (minutes < 16) return "var(--color-accent-2-500)";
  return "var(--color-accent-2-700)";
}

export function StreakClient() {
  const ownerId = useOwnerId();
  const [logs, setLogs] = useState<MeditationLog[]>([]);
  const [goal, setGoal] = useState(5);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!ownerId) return;
    void Promise.all([
      fetch("/api/logs", { cache: "no-store", headers: { "x-owner-id": ownerId } }).then((res) => res.json()),
      fetch("/api/settings", { cache: "no-store", headers: { "x-owner-id": ownerId } }).then((res) => res.json()),
    ]).then(([logsData, settingsData]) => {
      setLogs(logsData.logs ?? []);
      setGoal(settingsData.settings?.dailyGoalMinutes ?? 5);
      setLoaded(true);
    });
  }, [ownerId]);

  async function pickGoal(dailyGoalMinutes: 2 | 5 | 10) {
    setGoal(dailyGoalMinutes);
    if (!ownerId) return;
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-owner-id": ownerId },
      body: JSON.stringify({ dailyGoalMinutes }),
    });
  }

  const { current, longest } = useMemo(() => computeStreaks(logs, goal), [logs, goal]);
  const totalMinutes = useMemo(() => logs.reduce((sum, log) => sum + log.minutes, 0), [logs]);
  const grid = useMemo(() => computeGrid(logs), [logs]);

  if (!loaded) {
    return (
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "56px 24px 96px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 400, fontSize: 44, margin: "0 0 8px" }}>
          Your streak
        </h1>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "56px 24px 96px" }}>
      <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 400, fontSize: 44, margin: "0 0 8px" }}>
        Your streak
      </h1>
      <p style={{ color: "var(--color-neutral-700)", margin: "0 0 36px" }}>
        Twelve weeks of sitting. Darker squares are longer sits.
      </p>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 36 }}>
        <StatBlock value={current} label="day streak" bg="var(--color-accent-200)" fg="var(--color-accent-800)" />
        <StatBlock value={longest} label="longest run" bg="var(--color-accent-2-200)" fg="var(--color-accent-2-800)" />
        <StatBlock value={totalMinutes} label="minutes, all time" bg="var(--color-neutral-200)" fg="var(--color-neutral-800)" />
      </div>

      <div
        style={{
          background: "var(--color-neutral-100)",
          borderRadius: "var(--radius-lg)",
          padding: 28,
          boxShadow: "var(--shadow-sm)",
          overflowX: "auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gridAutoFlow: "column",
            gridTemplateRows: "repeat(7, 22px)",
            gap: 6,
            justifyContent: "start",
          }}
        >
          {grid.map((cell) => (
            <div
              key={cell.key}
              title={cell.date.toDateString() + (cell.minutes ? ` — ${cell.minutes} min` : " — no sit")}
              style={{ width: 22, height: 22, borderRadius: 7, background: cellColor(cell.minutes) }}
            />
          ))}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 20,
            fontSize: 13,
            color: "var(--color-neutral-700)",
          }}
        >
          <span>Less</span>
          <span style={{ width: 18, height: 18, borderRadius: 6, background: "var(--color-neutral-200)" }} />
          <span style={{ width: 18, height: 18, borderRadius: 6, background: "var(--color-accent-2-300)" }} />
          <span style={{ width: 18, height: 18, borderRadius: 6, background: "var(--color-accent-2-500)" }} />
          <span style={{ width: 18, height: 18, borderRadius: 6, background: "var(--color-accent-2-700)" }} />
          <span>More</span>
        </div>
      </div>

      <div
        style={{
          marginTop: 36,
          display: "flex",
          alignItems: "center",
          gap: 20,
          flexWrap: "wrap",
          background: "var(--color-neutral-100)",
          borderRadius: "var(--radius-lg)",
          padding: "24px 28px",
        }}
      >
        <div>
          <div style={{ fontWeight: 600 }}>Daily minimum</div>
          <div style={{ color: "var(--color-neutral-700)", fontSize: 15 }}>
            A sit counts toward the streak once it passes this.
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {DailyGoalOptions.map((option) => {
            const active = goal === option;
            return (
              <button
                key={option}
                type="button"
                className="btn btn-secondary"
                style={
                  active
                    ? {
                        background: "var(--color-accent-500)",
                        color: "#fff",
                        borderColor: "var(--color-accent-500)",
                      }
                    : undefined
                }
                onClick={() => void pickGoal(option)}
              >
                {option} min
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}

function StatBlock({ value, label, bg, fg }: { value: number; label: string; bg: string; fg: string }) {
  return (
    <div style={{ flex: "1 1 180px", background: bg, borderRadius: "var(--radius-lg)", padding: 24 }}>
      <div style={{ fontFamily: "var(--font-heading)", fontSize: 42, lineHeight: 1 }}>{value}</div>
      <div style={{ marginTop: 6, color: fg, fontWeight: 600 }}>{label}</div>
    </div>
  );
}
