"use client";

import { useState } from "react";
import { Nav } from "@/components/Nav";
import type { CvDocument } from "@/lib/cv";
import { downloadCvPdf } from "@/lib/pdf";

export default function CvBuilderPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [cv, setCv] = useState<CvDocument | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate CV");
      setCv(data.cv as CvDocument);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Nav active="cv" />
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-2">
        <section className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">CV Builder</h1>
              <p className="mt-1 text-sm text-zinc-600">
                Paste the job description. We rewrite your base CV to match it,
                then you download a PDF.
              </p>
            </div>
            {cv && (
              <button
                type="button"
                onClick={() => downloadCvPdf(cv, "Aakash_Goel_Tailored_CV")}
                className="shrink-0 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Download PDF
              </button>
            )}
          </div>

          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here..."
            className="min-h-72 w-full rounded-xl border border-zinc-200 bg-white p-4 text-sm leading-relaxed text-zinc-900 outline-none ring-zinc-900/10 placeholder:text-zinc-400 focus:ring-2"
          />

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={generate}
              disabled={loading || !jobDescription.trim()}
              className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Building CV..." : "Build tailored CV"}
            </button>
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          {!cv ? (
            <div className="flex h-full min-h-80 items-center justify-center text-sm text-zinc-400">
              Tailored CV preview will show here.
            </div>
          ) : (
            <article className="space-y-5 text-sm">
              <header>
                <h2 className="text-xl font-bold text-zinc-900">{cv.name}</h2>
                <p className="mt-1 text-zinc-700">{cv.title}</p>
                <p className="mt-1 text-xs text-zinc-500">{cv.contact}</p>
              </header>

              <div>
                <h3 className="text-xs font-semibold tracking-wide text-zinc-500">
                  SUMMARY
                </h3>
                <p className="mt-1 leading-relaxed text-zinc-800">{cv.summary}</p>
              </div>

              <div>
                <h3 className="text-xs font-semibold tracking-wide text-zinc-500">
                  TECHNICAL SKILLS
                </h3>
                <ul className="mt-2 space-y-1">
                  {cv.skills?.map((s) => (
                    <li key={s.label}>
                      <span className="font-medium">{s.label}:</span> {s.value}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-semibold tracking-wide text-zinc-500">
                  EXPERIENCE
                </h3>
                <div className="mt-3 space-y-4">
                  {cv.experience?.map((job) => (
                    <div key={`${job.company}-${job.role}-${job.dates}`}>
                      <p className="font-semibold text-zinc-900">
                        {job.role} - {job.company}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {[job.location, job.dates].filter(Boolean).join(" · ")}
                      </p>
                      {job.summary && (
                        <p className="mt-1 leading-relaxed text-zinc-700">
                          {job.summary}
                        </p>
                      )}
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-zinc-800">
                        {job.bullets?.map((b) => (
                          <li key={b.slice(0, 48)}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          )}
        </section>
      </main>
    </div>
  );
}
