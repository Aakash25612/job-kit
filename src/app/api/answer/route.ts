import { NextResponse } from "next/server";
import { chatText, stripEmDashes } from "@/lib/openai";
import { ANSWER_SYSTEM } from "@/lib/prompts";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const question = String(body.question || "").trim();
    const lengthNote = String(body.lengthNote || "").trim();

    if (!question) {
      return NextResponse.json(
        { error: "Paste the job question first." },
        { status: 400 },
      );
    }

    const userPrompt = [
      `Job application question:\n${question}`,
      lengthNote
        ? `Length preference from user: ${lengthNote}`
        : "Keep the answer short unless the question needs more detail.",
    ].join("\n\n");

    const answer = stripEmDashes(await chatText(ANSWER_SYSTEM, userPrompt));
    return NextResponse.json({ answer });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate answer";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
