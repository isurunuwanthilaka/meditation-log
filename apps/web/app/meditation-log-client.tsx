"use client";

import { FormEvent, useState } from "react";
import { MeditationLog, MoodOptions } from "@meditation-log/shared";

type FormState = {
  date: string;
  minutes: number;
  mood: (typeof MoodOptions)[number];
  notes: string;
};

const today = new Date().toISOString().slice(0, 10);

const initialForm: FormState = {
  date: today,
  minutes: 10,
  mood: "calm",
  notes: "",
};

export function MeditationLogClient({ initialLogs }: { initialLogs: MeditationLog[] }) {
  const [logs, setLogs] = useState<MeditationLog[]>(initialLogs);
  const [form, setForm] = useState<FormState>(initialForm);
  const [error, setError] = useState<string | null>(null);

  async function loadLogs() {
    const response = await fetch("/api/logs", { cache: "no-store" });
    const data = await response.json();
    setLogs(data.logs ?? []);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const response = await fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      setError("Unable to save log. Please check your data and try again.");
      return;
    }

    setForm(initialForm);
    await loadLogs();
  }

  async function removeLog(id: string) {
    await fetch(`/api/logs/${id}`, { method: "DELETE" });
    await loadLogs();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-10">
      <h1 className="text-3xl font-semibold">Meditation Log</h1>
      <p className="text-sm text-gray-600">
        Track daily sessions from web now and reuse the same API from mobile.
      </p>

      <form className="grid gap-3 rounded-xl border p-4" onSubmit={onSubmit}>
        <label className="grid gap-1 text-sm">
          Date
          <input
            className="rounded border px-3 py-2"
            type="date"
            value={form.date}
            onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
          />
        </label>

        <label className="grid gap-1 text-sm">
          Minutes
          <input
            className="rounded border px-3 py-2"
            type="number"
            min={1}
            max={600}
            value={form.minutes}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, minutes: Number(event.target.value) }))
            }
          />
        </label>

        <label className="grid gap-1 text-sm">
          Mood
          <select
            className="rounded border px-3 py-2"
            value={form.mood}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                mood: event.target.value as (typeof MoodOptions)[number],
              }))
            }
          >
            {MoodOptions.map((mood) => (
              <option key={mood} value={mood}>
                {mood}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1 text-sm">
          Notes
          <textarea
            className="rounded border px-3 py-2"
            rows={3}
            value={form.notes}
            onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
          />
        </label>

        <button className="rounded bg-black px-4 py-2 text-white" type="submit">
          Save session
        </button>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </form>

      <section className="grid gap-3">
        <h2 className="text-xl font-medium">Recent sessions</h2>
        {logs.length === 0 ? <p className="text-sm text-gray-600">No logs yet.</p> : null}
        {logs.map((log) => (
          <article key={log.id} className="grid gap-2 rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <strong>{log.date}</strong>
              <button
                className="text-sm text-red-600"
                type="button"
                onClick={() => void removeLog(log.id)}
              >
                Delete
              </button>
            </div>
            <p className="text-sm">
              {log.minutes} minutes • {log.mood}
            </p>
            {log.notes ? <p className="text-sm text-gray-700">{log.notes}</p> : null}
          </article>
        ))}
      </section>
    </main>
  );
}
