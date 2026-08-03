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
      `Tailor the CV to this job description:\n\n${jobDescription}`,
    );

    return NextResponse.json({ cv: cleanCv(cv) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate CV";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
