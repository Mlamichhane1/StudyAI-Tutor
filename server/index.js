import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";

const app = express();
app.use(express.json({ limit: "1mb" }));

// For local dev you can keep this permissive; tighten for production
app.use(cors({ origin: true }));

const openai = new OpenAI(); // reads OPENAI_API_KEY from env :contentReference[oaicite:2]{index=2}
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-2024-08-06";

// Schemas (Structured Outputs)
// Structured Outputs ensure schema-adherent JSON responses. :contentReference[oaicite:3]{index=3}
const StudyPlanSchema = z.object({
  title: z.string(),
  overview: z.string(),
  days: z.array(
    z.object({
      day: z.number().int().min(1),
      focus: z.string(),
      totalMinutes: z.number().int().min(10),
      tasks: z.array(
        z.object({
          title: z.string(),
          minutes: z.number().int().min(5),
          how: z.string()
        })
      ),
      checkpoint: z.string().optional()
    })
  ),
  tips: z.array(z.string()).min(3)
});

const QuizSchema = z.object({
  title: z.string(),
  instructions: z.string(),
  questions: z.array(
    z.object({
      type: z.enum(["mcq", "short"]),
      question: z.string(),
      choices: z.array(z.string()).optional(),
      answer: z.string(),
      rationale: z.string(),
      hint: z.string()
    })
  )
});

// Health check
app.get("/health", (req, res) => res.json({ ok: true }));

app.post("/api/study-plan", async (req, res) => {
  try {
    const body = z.object({
      syllabus: z.string().min(10),
      hoursPerDay: z.number().min(1).max(10),
      days: z.number().min(3).max(30),
      goal: z.string().min(2)
    }).parse(req.body);

    const system = `
You are StudyAI Tutor. Your job is to help the student learn effectively.
Do NOT do their graded work for them. If the user asks for direct answers to an exam/assignment,
redirect into a learning plan: explain concepts, show steps, give practice questions.
Output must follow the provided JSON schema exactly.
`.trim();

    const user = `
Create a ${body.days}-day study plan.
Available time: ${body.hoursPerDay} hours/day.
Goal: ${body.goal}

Syllabus / Topics:
${body.syllabus}

Rules:
- Break each day into concrete tasks with minutes.
- Include active recall + practice every day.
- Include checkpoints (mini-quiz, summary, teaching back).
`.trim();

    const response = await openai.responses.parse({
      model: MODEL,
      input: [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      text: { format: zodTextFormat(StudyPlanSchema, "study_plan") }
    });

    if (!response.output_parsed) {
      return res.status(500).json({ error: "No structured output returned." });
    }
    return res.json(response.output_parsed);
  } catch (err) {
    return res.status(400).json({ error: err?.message || "Bad request" });
  }
});

app.post("/api/quiz", async (req, res) => {
  try {
    const body = z.object({
      topic: z.string().min(2),
      difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
      count: z.number().min(3).max(20).default(8),
      notes: z.string().optional().default("")
    }).parse(req.body);

    const system = `
You are StudyAI Tutor. Generate practice questions that help learning.
Do not provide solutions to a user's specific graded prompt. Keep questions original.
Output must follow the provided JSON schema exactly.
`.trim();

    const user = `
Create a quiz on: ${body.topic}
Difficulty: ${body.difficulty}
Number of questions: ${body.count}

If notes are provided, tailor weak areas:
${body.notes}

Mix question types:
- Mostly MCQ with 4 choices
- Some short-answer
Include: hint, correct answer, and a short rationale for learning.
`.trim();

    const response = await openai.responses.parse({
      model: MODEL,
      input: [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      text: { format: zodTextFormat(QuizSchema, "quiz") }
    });

    if (!response.output_parsed) {
      return res.status(500).json({ error: "No structured output returned." });
    }
    return res.json(response.output_parsed);
  } catch (err) {
    return res.status(400).json({ error: err?.message || "Bad request" });
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
