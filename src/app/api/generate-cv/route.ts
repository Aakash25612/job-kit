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
      `Tailor the full CV to this job description for one full A4 page (not sparse, not overflowing). Make the experience section especially similar to what this role needs: reorder, rewrite, and prioritize bullets so his real work reads like a match for this job. Use 3 roles with 3 to 5 concise bullets each. Do not invent facts.\n\nJob description:\n\n${jobDescription}`,
    );

    return NextResponse.json({ cv: cleanCv(cv) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate CV";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
