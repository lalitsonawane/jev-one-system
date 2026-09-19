import { APIError, AuthenticationError } from "@typesafe-ai/sdk";
import { NextResponse } from "next/server";
import { decideRoute, type TriageAnswers } from "@/lib/routing";
import { buildTriageQuestions } from "@/lib/triage-questions";
import { getTypeSafeClient, hasApiKey } from "@/lib/typesafe";

export const runtime = "nodejs";

type TriageBody = {
  message?: unknown;
  channel?: unknown;
};

function serializeAnswers(answers: {
  department: {
    type: "choice";
    choice: string;
    confidence: number;
    probabilities: Record<string, number>;
  };
  frustration: {
    type: "score";
    score: number;
    confidence: number;
    legend: Record<string, string>;
    probabilities: Record<string, number>;
  };
  is_urgent: { type: "noul"; noul: number };
  refund_requested: { type: "noul"; noul: number };
  needs_human: { type: "noul"; noul: number };
}): TriageAnswers {
  return {
    department: {
      type: "choice",
      choice: answers.department.choice,
      confidence: answers.department.confidence,
      probabilities: { ...answers.department.probabilities },
    },
    frustration: {
      type: "score",
      score: answers.frustration.score,
      confidence: answers.frustration.confidence,
      legend: Object.fromEntries(
        Object.entries(answers.frustration.legend).map(([k, v]) => [
          k,
          String(v),
        ]),
      ),
      probabilities: Object.fromEntries(
        Object.entries(answers.frustration.probabilities).map(([k, v]) => [
          k,
          Number(v),
        ]),
      ),
    },
    is_urgent: { type: "noul", noul: answers.is_urgent.noul },
    refund_requested: {
      type: "noul",
      noul: answers.refund_requested.noul,
    },
    needs_human: { type: "noul", noul: answers.needs_human.noul },
  };
}

export async function GET() {
  return NextResponse.json({
    configured: hasApiKey(),
    model: "jev-latest",
    endpoint: "https://api.typesafe.ai/v1/systemone",
  });
}

export async function POST(request: Request) {
  if (!hasApiKey()) {
    return NextResponse.json(
      {
        error:
          "TYPESAFE_API_KEY is not set. Create .env.local with your Jev / TypeSafe API key.",
      },
      { status: 503 },
    );
  }

  let body: TriageBody;
  try {
    body = (await request.json()) as TriageBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  const channel =
    typeof body.channel === "string" && body.channel.trim()
      ? body.channel.trim()
      : "unknown";

  if (!message) {
    return NextResponse.json(
      { error: "Provide a non-empty `message` string." },
      { status: 400 },
    );
  }

  if (message.length > 8000) {
    return NextResponse.json(
      { error: "Message is too long (max 8000 characters)." },
      { status: 400 },
    );
  }

  const questions = buildTriageQuestions();
  const started = performance.now();

  try {
    const client = getTypeSafeClient();
    const result = await client.systemOne({
      model: "jev-latest",
      state: {
        channel,
        message,
      },
      questions,
    });

    const latencyMs = Math.round(performance.now() - started);
    const answers = serializeAnswers(result.answers);
    const decision = decideRoute(answers);

    return NextResponse.json({
      model: result.model,
      latencyMs,
      usage: result.usage,
      answers,
      decision,
      state: { channel, message },
    });
  } catch (error) {
    const latencyMs = Math.round(performance.now() - started);

    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        {
          error: "Invalid TypeSafe API key. Check TYPESAFE_API_KEY.",
          latencyMs,
        },
        { status: 401 },
      );
    }

    if (error instanceof APIError) {
      return NextResponse.json(
        {
          error: error.message || "TypeSafe API error",
          status: error.status,
          latencyMs,
        },
        { status: error.status && error.status >= 400 ? error.status : 502 },
      );
    }

    const messageText =
      error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json(
      { error: messageText, latencyMs },
      { status: 500 },
    );
  }
}
