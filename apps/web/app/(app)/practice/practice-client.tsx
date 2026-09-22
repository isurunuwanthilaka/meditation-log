"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MeditationLog } from "@meditation-log/shared";
import { useOwnerId } from "@/lib/use-owner-id";
import { relativeDayLabel } from "@/lib/streak";

const LENGTHS = [
  { minutes: 5, label: "5 min" },
  { minutes: 10, label: "10 min" },
  { minutes: 20, label: "20 min" },
  { minutes: 0, label: "Open" },
] as const;

function todayDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function formatClock(totalSeconds: number): string {
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function playBell() {
  try {
    const AudioContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextClass();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 528;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 2.5);
    oscillator.onended = () => void ctx.close();
  } catch {
    // Audio unavailable — the setting still recorded the intent, nothing to play.
  }
}

export function PracticeClient() {
  const ownerId = useOwnerId();
  const [target, setTarget] = useState(600);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<MeditationLog[]>([]);
  const [bellEnabled, setBellEnabled] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!ownerId) return;
    void fetch("/api/logs", { cache: "no-store", headers: { "x-owner-id": ownerId } })
      .then((res) => res.json())
      .then((data) => setLogs(data.logs ?? []));
    void fetch("/api/settings", { cache: "no-store", headers: { "x-owner-id": ownerId } })
      .then((res) => res.json())
      .then((data) => setBellEnabled(data.settings?.bellEnabled ?? true));
  }, [ownerId]);

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  function stopInterval() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function toggleRun() {
    if (running) {
      stopInterval();
      setRunning(false);
      return;
    }

    stopInterval();
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        const next = prev + 1;
        if (target && next >= target) {
          stopInterval();
          setRunning(false);
          if (bellEnabled) playBell();
          return target;
        }
        return next;
      });
    }, 1000);
  }

  function reset() {
    stopInterval();
    setRunning(false);
    setSeconds(0);
  }

  function pickLength(minutes: number) {
    stopInterval();
    setRunning(false);
    setSeconds(0);
    setTarget(minutes * 60);
  }

  async function save() {
    if (seconds < 30 || !ownerId) return;
    const minutes = Math.max(1, Math.round(seconds / 60));
    stopInterval();
    setRunning(false);
    setSeconds(0);

    const response = await fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-owner-id": ownerId },
      body: JSON.stringify({ date: todayDate(), minutes, mood: "calm", notes: "" }),
    });

    if (response.ok) {
      const data = await response.json();
      setLogs((prev) => [data.log, ...prev]);
    }
  }

  const clock = target ? formatClock(Math.max(0, target - seconds)) : formatClock(seconds);
  const timerLabel = running ? "sitting" : seconds > 0 ? "paused" : target ? "ready" : "open sit";
  const runLabel = running ? "Pause" : seconds > 0 ? "Resume" : "Begin";
  const subhead = target ? "A bell at the end. Nothing in between." : "Open sit — stop whenever you are done.";
  const recent = useMemo(() => logs.slice(0, 6), [logs]);

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "56px 24px 96px" }}>
      <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 400, fontSize: 44, margin: "0 0 8px" }}>
        Practice
      </h1>
      <p style={{ color: "var(--color-neutral-700)", margin: "0 0 40px" }}>{subhead}</p>

      <div
        style={{
          display: "grid",
          placeItems: "center",
          gap: 28,
          padding: "44px 24px",
          background: "var(--color-neutral-100)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div style={{ position: "relative", width: 300, height: 300, display: "grid", placeItems: "center" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 999,
              background: "var(--color-accent-200)",
              animation: "breathe 9s ease-in-out infinite",
              animationPlayState: running ? "running" : "paused",
            }}
          />
          <div style={{ position: "relative", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 64, lineHeight: 1 }}>{clock}</div>
            <div
              style={{
                marginTop: 6,
                fontSize: 14,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-neutral-700)",
              }}
            >
              {timerLabel}
            </div>
          </div>
        </div>

        <div className="seg" role="group" aria-label="Session length">
          {LENGTHS.map((len) => {
            const active = target === len.minutes * 60;
            return (
              <button
                key={len.label}
                type="button"
                className="seg-opt"
                aria-pressed={active}
                style={active ? { background: "var(--color-accent-500)", color: "#fff" } : undefined}
                onClick={() => pickLength(len.minutes)}
              >
                {len.label}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button type="button" className="btn btn-primary" onClick={toggleRun}>
            {runLabel}
          </button>
          <button type="button" className="btn btn-secondary" onClick={reset}>
            Reset
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => void save()}>
            Log this sit
          </button>
        </div>
      </div>

      <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 400, fontSize: 26, margin: "48px 0 16px" }}>
        Recent sits
      </h2>
      <div style={{ display: "grid", gap: 10 }}>
        {recent.length === 0 ? (
          <p style={{ color: "var(--color-neutral-700)" }}>No sits logged yet.</p>
        ) : null}
        {recent.map((log) => (
          <div
            key={log.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "14px 20px",
              background: "var(--color-neutral-100)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: "var(--color-accent-2-500)",
                flex: "none",
              }}
            />
            <strong style={{ minWidth: 78 }}>{log.minutes} min</strong>
            <span style={{ color: "var(--color-neutral-700)" }}>{relativeDayLabel(log.date)}</span>
            <span className="tag tag-neutral" style={{ marginLeft: "auto" }}>
              {log.mood}
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}
