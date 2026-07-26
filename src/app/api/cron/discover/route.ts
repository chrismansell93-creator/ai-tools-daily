import { NextRequest, NextResponse } from "next/server";
import { cronConfig } from "@/lib/config";
import { runDiscovery } from "@/lib/discover";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(req: NextRequest): boolean {
  const secret = cronConfig.secret;
  if (!secret) {
    if (process.env.NODE_ENV === "production") return false;
    const host = req.headers.get("host") || "";
    return host.startsWith("localhost") || host.startsWith("127.0.0.1");
  }
  const auth = req.headers.get("authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const headerSecret = req.headers.get("x-cron-secret") || "";
  const querySecret = req.nextUrl.searchParams.get("secret") || "";
  return bearer === secret || headerSecret === secret || querySecret === secret;
}

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}

async function handle(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized. Set CRON_SECRET and pass Authorization: Bearer <secret>" },
      { status: 401 },
    );
  }
  try {
    const result = await runDiscovery();
    return NextResponse.json(result, { status: result.ok ? 200 : 502 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
