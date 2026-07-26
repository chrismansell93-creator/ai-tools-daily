import { affiliateConfig, type AffiliateOffer } from "./config";

export function amazonSearchUrl(query: string): string | null {
  const tag = affiliateConfig.amazonTag;
  if (!tag) return null;
  const q = encodeURIComponent(query);
  return `https://www.amazon.com/s?k=${q}&tag=${encodeURIComponent(tag)}`;
}

export function matchOffers(text: string, limit = 4): AffiliateOffer[] {
  const offers = affiliateConfig.offers;
  if (!offers.length) return [];
  const hay = text.toLowerCase();
  const scored = offers.map((offer) => {
    const keys = [
      ...(offer.keywords ?? []),
      ...offer.title.toLowerCase().split(/\s+/),
    ].filter(Boolean);
    let score = 0;
    for (const k of keys) {
      if (hay.includes(k.toLowerCase())) score += 1;
    }
    if ((offer.keywords ?? []).length === 0) score = Math.max(score, 0.5);
    return { offer, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.offer);
}
