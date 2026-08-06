import { getSetupStatus } from "@/lib/config";

export function SetupBanner() {
  const setup = getSetupStatus();
  const missing: string[] = [];
  if (!setup.youtube) missing.push("YOUTUBE_API_KEY");
  if (!setup.niche) missing.push("NICHE_KEYWORDS");
  if (!setup.siteUrl) missing.push("NEXT_PUBLIC_SITE_URL");

  if (missing.length === 0) return null;

  return (
    <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-sm text-amber-100">
      <strong className="font-semibold">Setup incomplete.</strong>{" "}
      Add env vars: {missing.join(", ")}. Then POST /api/cron/discover with your CRON_SECRET.
    </div>
  );
}
