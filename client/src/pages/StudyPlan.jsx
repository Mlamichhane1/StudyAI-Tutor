import React, { useState } from "react";
import { postJSON } from "../lib/api";

export default function StudyPlan() {
  const [syllabus, setSyllabus] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [days, setDays] = useState(7);
  const [goal, setGoal] = useState("Midterm prep");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");

  async function onGenerate() {
    setErr("");
    setResult(null);
    setLoading(true);
    try {
      const data = await postJSON("/api/study-plan", {
        syllabus,
        hoursPerDay,
        days,
        goal,
      });
      setResult(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
        <h1 className="text-xl font-semibold">📅 Smart Study Plan</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Paste your syllabus/topics, set time + days, get a daily plan.
        </p>

        <div className="mt-4 grid gap-4">
          <textarea
            className="w-full min-h-[140px] rounded-xl bg-zinc-900 border border-white/10 p-3 text-sm"
            placeholder="Paste syllabus / topics (e.g., Chapters 1–7, key concepts, exam date, etc.)"
            value={syllabus}
            onChange={(e) => setSyllabus(e.target.value)}
          />

          <div className="grid md:grid-cols-3 gap-3">
            <label className="text-sm">
              <div className="text-zinc-400 mb-1">Hours/day</div>
              <input
                type="number"
                min={1}
                max={10}
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(Number(e.target.value))}
                className="w-full rounded-xl bg-zinc-900 border border-white/10 p-2"
              />
            </label>

            <label className="text-sm">
              <div className="text-zinc-400 mb-1">Days</div>
              <input
                type="number"
                min={3}
                max={30}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full rounded-xl bg-zinc-900 border border-white/10 p-2"
              />
            </label>

            <label className="text-sm">
              <div className="text-zinc-400 mb-1">Goal</div>
              <input
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full rounded-xl bg-zinc-900 border border-white/10 p-2"
              />
            </label>
          </div>

          <button
            onClick={onGenerate}
            disabled={loading || !syllabus.trim()}
            className="rounded-xl bg-emerald-500/20 border border-emerald-400/30 px-4 py-2 hover:bg-emerald-500/25 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Plan"}
          </button>

          {err && (
            <div className="text-sm text-red-300 border border-red-500/30 bg-red-500/10 p-3 rounded-xl">
              {err}
            </div>
          )}
        </div>
      </div>

      {result && (
        <div className="p-5 rounded-2xl border border-white/10 bg-white/5 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">{result.title}</h2>
            <p className="text-sm text-zinc-400">{result.overview}</p>
          </div>

          <div className="grid gap-3">
            {result.days.map((d, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">
                    Day {d.day}: {d.focus}
                  </div>
                  <div className="text-xs text-zinc-400">
                    ~{d.totalMinutes} min
                  </div>
                </div>
                <ul className="mt-2 space-y-2 text-sm">
                  {d.tasks.map((t, i) => (
                    <li
                      key={i}
                      className="flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="font-medium">{t.title}</div>
                        <div className="text-zinc-400 text-xs">{t.how}</div>
                      </div>
                      <div className="text-xs text-zinc-400 whitespace-nowrap">
                        {t.minutes} min
                      </div>
                    </li>
                  ))}
                </ul>
                {d.checkpoint && (
                  <div className="mt-3 text-xs text-emerald-200/80 border border-emerald-400/20 bg-emerald-500/10 p-2 rounded-xl">
                    ✅ Checkpoint: {d.checkpoint}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-sm text-zinc-300">
            <div className="font-semibold mb-1">Tips</div>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              {result.tips.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
