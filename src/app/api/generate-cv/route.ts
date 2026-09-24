import { NextResponse } from "next/server";
import type { CvDocument } from "@/lib/cv";
import { chatJson, stripEmDashes } from "@/lib/openai";
import { CV_SYSTEM } from "@/lib/prompts";

export const runtime = "nodejs";

function cleanCv(cv: CvDocument): CvDocument {
  return {
    name: stripEmDashes(cv.name),
    title: stripEmDashes(cv.title),
    contact: stripEmDashes(cv.contact),
    summary: stripEmDashes(cv.summary),
    skills: (cv.skills || []).map((s) => ({
      label: stripEmDashes(s.label),
      value: stripEmDashes(s.value),
    })),
    experience: (cv.experience || []).slice(0, 4).map((e) => ({
      role: stripEmDashes(e.role),
      company: stripEmDashes(e.company),
      dates: stripEmDashes(e.dates),
      location: stripEmDashes(e.location),
      summary: e.summary ? stripEmDashes(e.summary) : undefined,
      bullets: (e.bullets || []).map(stripEmDashes),
    })),
    projects: (cv.projects || []).slice(0, 3).map((p) => ({
      name: stripEmDashes(p.name),
      description: stripEmDashes(p.description),
    })),
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const jobDescription = String(body.jobDescription || "").trim();
    if (!jobDescription) {
      return NextResponse.json(
        { error: "Paste a job description first." },
        { status: 400 },
      );
    }

    const cv = await chatJson<CvDocument>(
      CV_SYSTEM,
      `Build a DEDICATED CV for this job description, one full A4 page (dense, not sparse, not overflowing).

Requirements:
- Keep real employers, dates, contact, and seniority from the base CV.
- Skills must match the job stack and domain.
- Map every major JD responsibility (including numbered items if present) into concrete experience bullets and/or skill lines.
- Rewrite bullets in the job's language so the CV feels written for this role, not a lightly edited generic resume.
- Always use exactly 4 experience roles from the base CV, with 3 to 5 concise bullets on the strongest roles (later roles can be shorter).
- Always include a PROJECTS section with 2 to 3 items from the base CV.
- Do not invent fake companies or fake dates.

Job description:

${jobDescription}`,
    );

    return NextResponse.json({ cv: cleanCv(cv) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate CV";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
