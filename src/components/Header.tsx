import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { getTopics } from "@/lib/topics";

export function Header() {
  const topics = getTopics().slice(0, 6);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="shrink-0 font-bold tracking-tight text-white">
          <span className="text-red-500">●</span> {siteConfig.name}
        </Link>

        <nav className="hidden flex-1 items-center gap-1 overflow-x-auto md:flex">
          {topics.map((t) => (
            <Link
              key={t.slug}
              href={`/topic/${t.slug}`}
              className="rounded-full px-3 py-1 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
            >
              {t.label}
            </Link>
          ))}
        </nav>

        <form action="/search" method="get" className="ml-auto flex max-w-md flex-1">
          <input
            type="search"
            name="q"
            placeholder="Search videos…"
            className="w-full rounded-l-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none ring-red-500/40 placeholder:text-zinc-500 focus:ring-2"
            required
          />
          <button
            type="submit"
            className="rounded-r-lg bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-500"
          >
            Search
          </button>
        </form>
      </div>
    </header>
  );
}
