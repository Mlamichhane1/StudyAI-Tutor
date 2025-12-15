import React from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import StudyPlan from "./pages/StudyPlan.jsx";
import Quiz from "./pages/Quiz.jsx";
import Pomodoro from "./pages/Pomodoro.jsx";

const LinkTab = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `px-3 py-2 rounded-lg text-sm ${
        isActive ? "bg-white/10" : "hover:bg-white/5"
      }`
    }
  >
    {children}
  </NavLink>
);

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 backdrop-blur border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="font-semibold tracking-tight">🤖 StudyAI Tutor</div>
          <nav className="flex gap-2">
            <LinkTab to="/">Study Plan</LinkTab>
            <LinkTab to="/quiz">Quiz</LinkTab>
            <LinkTab to="/pomodoro">Pomodoro</LinkTab>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<StudyPlan />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/pomodoro" element={<Pomodoro />} />
        </Routes>
      </main>
    </div>
  );
}
