import React, { useState } from "react";
import { postJSON } from "../lib/api";

export default function Quiz() {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [count, setCount] = useState(8);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [err, setErr] = useState("");
  const [reveal, setReveal] = useState(false);

  async function onGenerate() {
    setErr("");
    setQuiz(null);
    setReveal(false);
    setLoading(true);
    try {
      const data = await postJSON("/api/quiz", {
        topic,
        difficulty,
        count,
        notes,
      });
      setQuiz(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
        <h1 className="text-xl font-semibold">❓ AI Quiz Mode</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Practice questions + rationales. (Helps you learn — not cheat.)
        </p>

        <div className="mt-4 grid gap-4">
          <div className="grid md:grid-cols-3 gap-3">
            <label className="text-sm">
              <div className="text-zinc-400 mb-1">Topic</div>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full rounded-xl bg-zinc-900 border border-white/10 p-2"
                placeholder="e.g., Hypothesis testing"
              />
            </label>

            <label className="text-sm">
              <div className="text-zinc-400 mb-1">Difficulty</div>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full rounded-xl bg-zinc-900 border border-white/10 p-2"
              >
                <option value="easy">easy</option>
                <option value="medium">medium</option>
                <option value="hard">hard</option>
              </select>
            </label>

            <label className="text-sm">
              <div className="text-zinc-400 mb-1"># Questions</div>
              <input
                type="number"
                min={3}
                max={20}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full rounded-xl bg-zinc-900 border border-white/10 p-2"
              />
            </label>
          </div>

          <textarea
            className="w-full min-h-[90px] rounded-xl bg-zinc-900 border border-white/10 p-3 text-sm"
            placeholder="Optional: paste your notes or what you’re struggling with..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex gap-3 items-center">
            <button
              onClick={onGenerate}
              disabled={loading || !topic.trim()}
              className="rounded-xl bg-sky-500/20 border border-sky-400/30 px-4 py-2 hover:bg-sky-500/25 disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate Quiz"}
            </button>

            {quiz && (
              <button
                onClick={() => setReveal((v) => !v)}
                className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 hover:bg-white/10"
              >
                {reveal ? "Hide Answers" : "Reveal Answers"}
              </button>
            )}
          </div>

          {err && (
            <div className="text-sm text-red-300 border border-red-500/30 bg-red-500/10 p-3 rounded-xl">
              {err}
            </div>
          )}
        </div>
      </div>

      {quiz && (
        <div className="p-5 rounded-2xl border border-white/10 bg-white/5 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">{quiz.title}</h2>
            <p className="text-sm text-zinc-400">{quiz.instructions}</p>
          </div>

          <div className="space-y-4">
            {quiz.questions.map((q, idx) => (
              <div key={idx} className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4">
                <div className="font-semibold">
                  {idx + 1}) {q.question}
                </div>

                {q.type === "mcq" && (
                  <ul className="mt-2 space-y-1 text-sm text-zinc-300">
                    {q.choices.map((c, i) => (
                      <li key={i} className="text-zinc-400">
                        {String.fromCharCode(65 + i)}. {c}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-3 text-sm">
                  <div className="text-zinc-400">Hint:</div>
                  <div className="text-zinc-300">{q.hint}</div>
                </div>

                {reveal && (
                  <div className="mt-3 text-sm border border-emerald-400/20 bg-emerald-500/10 p-3 rounded-xl">
                    <div className="font-semibold">Answer: {q.answer}</div>
                    <div className="text-zinc-200/90 mt-1">{q.rationale}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
