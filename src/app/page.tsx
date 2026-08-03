import Link from "next/link";
import { Nav } from "@/components/Nav";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Nav active="home" />
      <main className="mx-auto max-w-5xl px-4 py-16">
        <p className="text-sm font-medium text-zinc-500">Aakash Goel</p>
        <h1 className="mt-2 max-w-2xl text-4xl font-semibold tracking-tight text-zinc-900">
          Job Kit
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-zinc-600">
          Two tools for applications. Tailor a CV from a job description, or
          draft short human answers to form questions. Both use your base full
          stack CV.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link
            href="/cv"
            className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-zinc-300 hover:shadow"
          >
            <h2 className="text-lg font-semibold text-zinc-900">CV Builder</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
              Paste a job description. Get a tailored CV and download a PDF.
            </p>
          </Link>
          <Link
            href="/answer"
            className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-zinc-300 hover:shadow"
          >
            <h2 className="text-lg font-semibold text-zinc-900">
              Answer Questions
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
              Paste a job question. Get a short, CV-grounded answer you can
              paste into the form.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
