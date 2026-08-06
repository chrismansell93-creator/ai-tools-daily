import { adsenseConfig } from "@/lib/config";

type Slot = "infeed" | "sidebar" | "article";

const slotMap: Record<Slot, string> = {
  infeed: adsenseConfig.slotInfeed,
  sidebar: adsenseConfig.slotSidebar,
  article: adsenseConfig.slotArticle,
};

export function AdUnit({
  slot,
  className = "",
}: {
  slot: Slot;
  className?: string;
}) {
  if (!adsenseConfig.isConfigured) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-dashed border-zinc-800 text-xs text-zinc-600 ${className}`}
      >
        Ad placeholder
      </div>
    );
  }

  const adSlot = slotMap[slot];
  if (!adSlot) return null;

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adsenseConfig.client}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
