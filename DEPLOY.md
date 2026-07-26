# Deploy AI Tools Daily to Vercel (finish in 5 minutes)

## Option A — Vercel Dashboard (easiest)

1. Open https://vercel.com/new
2. Import GitHub repo: **chrismansell93-creator/ai-tools-daily**
   - Or drag-and-drop the project folder from your computer
3. Add Environment Variables (Project → Settings → Environment Variables):

| Name | Value |
|------|-------|
| `YOUTUBE_API_KEY` | your Google YouTube Data API key |
| `NICHE_KEYWORDS` | `ai tools,chatgpt tutorial,midjourney guide,claude ai` |
| `TOPIC_SLUGS` | `ai-tools,chatgpt,midjourney,claude-ai` |
| `CRON_SECRET` | long random string |
| `NEXT_PUBLIC_SITE_NAME` | `AI Tools Daily` |
| `NEXT_PUBLIC_SITE_DESCRIPTION` | `Real YouTube tutorials for AI tools` |
| `NEXT_PUBLIC_SITE_URL` | `https://YOUR-project.vercel.app` (update after first deploy) |

4. Deploy
5. After live, run discovery once:

```bash
curl -X POST "https://YOUR-project.vercel.app/api/cron/discover" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Option B — CLI

```bash
cd youtube-revenue
npx vercel login
npx vercel --prod
```

## Already created

- Vercel project: `ai-tools-daily`
- GitHub: https://github.com/chrismansell93-creator/ai-tools-daily

**Do not commit `.env.local`** (contains your API key).
