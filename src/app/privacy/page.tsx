import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-4 text-zinc-300">
      <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
      <p>
        <strong className="text-white">{siteConfig.name}</strong> embeds public YouTube videos and may
        display ads (Google AdSense) and affiliate links when configured.
      </p>
      <p>
        YouTube and Google may set cookies and collect usage data according to their own policies when
        you watch embeds or view ads. We do not sell personal data.
      </p>
      <p className="text-sm text-zinc-500">
        This is a short placeholder policy for a niche media demo. Replace with counsel-reviewed terms
        before monetizing at scale.
      </p>
    </article>
  );
}
