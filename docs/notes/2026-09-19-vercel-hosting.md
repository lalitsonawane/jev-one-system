# 2026-09-19 — Jev One — Vercel hosting

Repo mirror of the Project Knowledge Library session note.

## Outcome

Linked `lalitsonawane/jev-one-system` to a new Vercel project on the **Apptonic's projects** team and confirmed a successful production deploy from `main`.

## Key decisions

- Use Git-linked Vercel project (auto-deploy on push to `main`) rather than one-off CLI deploys.
- Keep `TYPESAFE_API_KEY` server-only (Vercel env → Next.js route handlers). Do not expose it to the browser.
- Document the production URL and env requirement in README.

## Artifacts / links

- Vercel project: https://vercel.com/apptonics-projects/jev-one-system
- Production: https://jev-one-system.vercel.app
- Project id: `prj_6c4VsmBYAVFRcmhc5tcWQgx2SWrO`
- Team: `apptonics-projects` (`team_LMfHTd1yMHcim4MKllLEanoo`)

## Open follow-ups

- Set `TYPESAFE_API_KEY` in Vercel (Production + Preview) and redeploy so triage works live.
- Optional: disable Vercel Deployment Protection if the demo should be public without login.

## Notion

- Library entry: https://app.notion.com/p/3e089f54d2c281fbbe61e447d8deafa2
- Data source: collection://f0c83c93-62b6-4e7a-a0e3-3f6d687bc220
