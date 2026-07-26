import { NextResponse } from "next/server";
import { getSetupStatus, siteConfig } from "@/lib/config";
import { getCatalog, getStats } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const setup = getSetupStatus();
  const catalog = await getCatalog();
  const stats = await getStats();
  return NextResponse.json({
    ok: true,
    site: siteConfig.name,
    setup,
    catalog: { videoCount: catalog.videos.length, updatedAt: catalog.updatedAt },
    discovery: stats,
    mockData: false,
  });
}
