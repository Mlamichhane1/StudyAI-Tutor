import React, { useEffect, useMemo, useState } from "react";

export default function Pomodoro() {
  const [mode, setMode] = useState("focus"); // focus | break
  const [focusMin, setFocusMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);

  const targetSeconds = useMemo(
    () => (mode === "focus" ? focusMin : breakMin) * 60,
    [mode, focusMin, breakMin]
  );

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    if (secondsLeft > 0) return;

    // switch modes
    const next = mode === "focus" ? "break" : "focus";
    setMode(next);
    setSecondsLeft((next === "focus" ? focusMin : breakMin) * 60);
  }, [secondsLeft, running, mode, focusMin, breakMin]);

  useEffect(() => {
    if (!running) setSecondsLeft(targetSeconds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusMin, breakMin, mode]);

  const mm = String(Math.floor(Math.max(secondsLeft, 0) / 60)).padStart(2, "0");
  const ss = String(Math.max(secondsLeft, 0) % 60).padStart(2, "0");

  return (
    <div className="p-5 rounded-2xl border border-white/10 bg-white/5 space-y-4">
      <h1 className="text-xl font-semibold">⏰ Pomodoro</h1>

      <div className="flex gap-2">
        <button
          onClick={() => { setMode("focus"); setRunning(false); }}
          className={`px-3 py-2 rounded-xl border border-white/10 ${mode === "focus" ? "bg-white/10" : "bg-white/5 hover:bg-white/10"}`}
        >
          Focus
        </button>
        <button
          onClick={() => { setMode("break"); setRunning(false); }}
          className={`px-3 py-2 rounded-xl border border-white/10 ${mode === "break" ? "bg-white/10" : "bg-white/5 hover:bg-white/10"}`}
        >
          Break
        </button>
      </div>

      <div className="text-6xl font-semibold tracking-tight">{mm}:{ss}</div>

      <div className="flex gap-2">
        <button
          onClick={() => setRunning((r) => !r)}
          className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 hover:bg-white/10"
        >
          {running ? "Pause" : "Start"}
        </button>
        <button
          onClick={() => { setRunning(false); setSecondsLeft(targetSeconds); }}
          className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 hover:bg-white/10"
        >
          Reset
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-3 text-sm">
        <label>
          <div className="text-zinc-400 mb-1">Focus (min)</div>
          <input
            type="number"
            min={10}
            max={90}
            value={focusMin}
            onChange={(e) => setFocusMin(Number(e.target.value))}
            className="w-full rounded-xl bg-zinc-900 border border-white/10 p-2"
          />
        </label>
        <label>
          <div className="text-zinc-400 mb-1">Break (min)</div>
          <input
            type="number"
            min={3}
            max={30}
            value={breakMin}
            onChange={(e) => setBreakMin(Number(e.target.value))}
            className="w-full rounded-xl bg-zinc-900 border border-white/10 p-2"
          />
        </label>
      </div>
    </div>
  );
}
