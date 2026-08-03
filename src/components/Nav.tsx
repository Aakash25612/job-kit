import Link from "next/link";

const links = [
  { href: "/cv", label: "CV Builder" },
  { href: "/answer", label: "Answer Questions" },
];

export function Nav({ active }: { active?: "cv" | "answer" | "home" }) {
  return (
    <header className="border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-sm font-semibold tracking-tight text-zinc-900">
          Job Kit
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((link) => {
            const isActive =
              (active === "cv" && link.href === "/cv") ||
              (active === "answer" && link.href === "/answer");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-1.5 text-sm transition ${
                  isActive
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
