# Jev One — System One triage demo

Live Next.js demo of [TypeSafe Jev](https://typesafe.ai) (`jev-latest`): a System One model that returns typed decisions and probabilities instead of generated text.

## What it shows

1. **State in** — a support ticket (`channel` + `message`)
2. **Five questions in one call** — Choice (department), Score (frustration), Noul (urgency / refund / needs human)
3. **Code routes** — thresholds in `src/lib/routing.ts` turn probabilities into queue actions

API: `POST https://api.typesafe.ai/v1/systemone` via [`@typesafe-ai/sdk`](https://docs.typesafe.ai/sdk/javascript).

## Setup

```bash
npm install
cp .env.example .env.local
# paste your TypeSafe API key into .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Your key stays on the server (`src/app/api/triage/route.ts`). Never expose it to the browser.

## Project map

| Path | Role |
| --- | --- |
| `src/app/api/triage/route.ts` | Server route → Jev |
| `src/lib/triage-questions.ts` | Question definitions |
| `src/lib/routing.ts` | Confidence-gated routing policy |
| `src/components/TriageDemo.tsx` | UI |

## Docs

- [TypeSafe docs](https://docs.typesafe.ai)
- [API reference](https://docs.typesafe.ai/api)
- [Introducing Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev)
