import OpenAI from "openai";

export function getOpenAI() {
  const apiKey = process.env.GPT_API_KEY;
  if (!apiKey) {
    throw new Error("GPT_API_KEY is not set. Add it in Vercel env or .env.local.");
  }
  return new OpenAI({ apiKey });
}

export async function chatJson<T>(system: string, user: string): Promise<T> {
  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from OpenAI");
  return JSON.parse(content) as T;
}

export async function chatText(system: string, user: string): Promise<string> {
  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.55,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) throw new Error("Empty response from OpenAI");
  return content;
}

/** Strip em dashes and similar punctuation the user does not want. */
export function stripEmDashes(text: string): string {
  return text
    .replace(/\u2014/g, "-")
    .replace(/\u2013/g, "-")
    .replace(/—/g, "-")
    .replace(/–/g, "-");
}
