"use client";

import { useState } from "react";
import { Nav } from "@/components/Nav";

export default function AnswerPage() {
  const [question, setQuestion] = useState("");
  const [lengthNote, setLengthNote] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function generate() {
    setLoading(true);
    setError("");
    setCopied(false);
    try {
      const res = await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, lengthNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate answer");
      setAnswer(data.answer as string);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function copyAnswer() {
    if (!answer) return;
    await navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="min-h-screen">
      <Nav active="answer" />
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Answer Questions
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Paste a question from a job application. Answers stay short and
            human by default, grounded in your CV when possible.
          </p>
        </div>

        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Paste the question here..."
          className="min-h-36 w-full rounded-xl border border-zinc-200 bg-white p-4 text-sm leading-relaxed outline-none ring-zinc-900/10 placeholder:text-zinc-400 focus:ring-2"
        />

        <input
          value={lengthNote}
          onChange={(e) => setLengthNote(e.target.value)}
          placeholder='Optional length note, e.g. "longer, around 150 words"'
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none ring-zinc-900/10 placeholder:text-zinc-400 focus:ring-2"
        />

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={generate}
            disabled={loading || !question.trim()}
            className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Writing..." : "Generate answer"}
          </button>
          {answer && (
            <button
              type="button"
              onClick={copyAnswer}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {answer && (
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-xs font-semibold tracking-wide text-zinc-500">
              ANSWER
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-800">
              {answer}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
