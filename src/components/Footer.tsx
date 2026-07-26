import Link from "next/link";
import { siteConfig } from "@/lib/config";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-medium text-zinc-300">{siteConfig.name}</p>
          <p className="mt-1 max-w-md">
            Independent niche media hub. Videos embed from YouTube and remain
            property of their creators. Monetization via AdSense and disclosed
            affiliate links when configured.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/privacy" className="hover:text-white">Privacy</Link>
          <Link href="/disclosure" className="hover:text-white">Affiliate disclosure</Link>
          <a href="https://www.youtube.com/t/terms" target="_blank" rel="noreferrer" className="hover:text-white">YouTube Terms</a>
        </div>
      </div>
    </footer>
  );
}
