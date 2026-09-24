import { NextResponse } from "next/server";
import type { CvDocument } from "@/lib/cv";
import { UPWORK_PROJECT, UPWORK_PROFILE_URL } from "@/lib/cv";
import { chatJson, stripEmDashes } from "@/lib/openai";
import { CV_SYSTEM } from "@/lib/prompts";

export const runtime = "nodejs";

function ensureUpworkProject(
  projects: { name: string; description: string }[],
): { name: string; description: string }[] {
  const cleaned = projects.map((p) => ({
    name: stripEmDashes(p.name),
    description: stripEmDashes(p.description),
  }));

  const upworkIndex = cleaned.findIndex(
    (p) => /upwork/i.test(p.name) || /upwork\.com/i.test(p.description),
  );

  if (upworkIndex >= 0) {
    cleaned[upworkIndex] = {
      name: "Upwork",
      description: cleaned[upworkIndex].description.includes(UPWORK_PROFILE_URL)
        ? cleaned[upworkIndex].description
        : UPWORK_PROJECT.description,
    };
    return cleaned.slice(0, 3);
  }

  return [...cleaned.slice(0, 2), UPWORK_PROJECT];
}

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
      bullets: (e.bullets || []).map(stripEmDashes).slice(0, 4),
    })),
    projects: ensureUpworkProject(cv.projects || []),
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
- Always use exactly 4 experience roles from the base CV.
- Under every experience role, always include exactly 4 concise bullets that use the job's keywords and stack where relevant.
- Always include a PROJECTS & PROFILE section with 2 to 3 items from the base CV, and always include Upwork with https://www.upwork.com/freelancers/aakashgoel
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
