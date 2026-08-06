# AI Tools Daily

Autonomous YouTube niche media site — real YouTube Data API, AdSense-ready, Vercel cron discovery.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- YouTube Data API v3 discovery & search
- File / memory catalog store (`data/catalog.json`)
- Vercel Cron: every 6 hours → `/api/cron/discover`

## Local

```bash
cp .env.example .env.local
# fill YOUTUBE_API_KEY, NICHE_KEYWORDS, CRON_SECRET
npm install
npm run dev
```

Trigger discovery:

```bash
curl -X POST "http://127.0.0.1:3000/api/cron/discover" \
  -H "Authorization: Bearer $CRON_SECRET"
```

## Deploy (Vercel)

See [DEPLOY.md](./DEPLOY.md). Set env vars, deploy, then run discover once.

## Notes

- On serverless, catalog writes may only persist in memory / `/tmp` for the instance. For durable production storage, swap `src/lib/store.ts` for a database or Blob store.
- Videos remain on YouTube; this site only embeds URLs from the API.
