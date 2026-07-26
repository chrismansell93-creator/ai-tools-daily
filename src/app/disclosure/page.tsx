import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = { title: "Affiliate Disclosure" };

export default function DisclosurePage() {
  return (
    <article className="mx-auto max-w-3xl space-y-4 text-zinc-300">
      <h1 className="text-3xl font-bold text-white">Affiliate Disclosure</h1>
      <p>
        <strong className="text-white">{siteConfig.name}</strong> participates in affiliate marketing programs.
        We may earn a commission if you click a link and make a purchase, at no additional cost to you.
      </p>
      <p>As an Amazon Associate we may earn from qualifying purchases when an Amazon tag is configured.</p>
      <p className="text-sm text-zinc-500">Required by the FTC and Amazon Associates Operating Agreement.</p>
    </article>
  );
}
