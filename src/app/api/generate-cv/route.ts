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
    experience: (cv.experience || []).map((e) => ({
      role: stripEmDashes(e.role),
      company: stripEmDashes(e.company),
      dates: stripEmDashes(e.dates),
      location: stripEmDashes(e.location),
      summary: e.summary ? stripEmDashes(e.summary) : undefined,
      bullets: (e.bullets || []).map(stripEmDashes),
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
      `Build a DEDICATED CV for this job description, one full A4 page (not sparse, not overflowing).

Requirements:
- Keep real employers, dates, contact, and seniority from the base CV.
- Skills must match the job stack and domain.
- Map every major JD responsibility (including numbered items if present) into concrete experience bullets and/or skill lines.
- Rewrite bullets in the job's language so the CV feels written for this role, not a lightly edited generic resume.
- Use 3 roles with 3 to 5 concise bullets each.
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
