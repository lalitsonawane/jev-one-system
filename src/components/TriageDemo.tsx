"use client";

import { useEffect, useState, useTransition } from "react";
import type { RoutingDecision, TriageAnswers } from "@/lib/routing";
import { SAMPLE_TICKETS } from "@/lib/samples";

type TriageSuccess = {
  model: string;
  latencyMs: number;
  usage: { input_tokens: number; output_tokens: number };
  answers: TriageAnswers;
  decision: RoutingDecision;
  state: { channel: string; message: string };
};

type ConfigResponse = {
  configured: boolean;
  model: string;
  endpoint: string;
};

function formatPct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function ProbabilityMeter({
  label,
  value,
  accent = "var(--accent)",
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <div className="meter">
      <div className="meter-label">
        <span>{label}</span>
        <span className="mono">{formatPct(clamped)}</span>
      </div>
      <div className="meter-track">
        <div
          className="meter-fill"
          style={{ width: `${clamped * 100}%`, background: accent }}
        />
      </div>
    </div>
  );
}

function actionTone(action: RoutingDecision["action"]): string {
  switch (action) {
    case "auto_route":
      return "tone-ok";
    case "priority_queue":
      return "tone-warn";
    case "refund_playbook":
      return "tone-info";
    case "human_review":
      return "tone-alert";
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

export function TriageDemo() {
  const [message, setMessage] = useState(SAMPLE_TICKETS[0].message);
  const [channel, setChannel] = useState(SAMPLE_TICKETS[0].channel);
  const [activeSample, setActiveSample] = useState(SAMPLE_TICKETS[0].id);
  const [result, setResult] = useState<TriageSuccess | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/triage")
      .then((res) => res.json() as Promise<ConfigResponse>)
      .then((data) => {
        if (!cancelled) setConfigured(data.configured);
      })
      .catch(() => {
        if (!cancelled) setConfigured(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function loadSample(id: string) {
    const sample = SAMPLE_TICKETS.find((s) => s.id === id);
    if (!sample) return;
    setActiveSample(sample.id);
    setMessage(sample.message);
    setChannel(sample.channel);
    setError(null);
  }

  function runTriage() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/triage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, channel }),
        });
        const data = (await res.json()) as TriageSuccess & { error?: string };
        if (!res.ok) {
          setResult(null);
          setError(data.error ?? `Request failed (${res.status})`);
          return;
        }
        setResult(data);
      } catch (err) {
        setResult(null);
        setError(err instanceof Error ? err.message : "Network error");
      }
    });
  }

  return (
    <div className="demo-shell">
      <header className="hero">
        <p className="brand">Jev One</p>
        <h1>Support triage that returns decisions, not paragraphs.</h1>
        <p className="lede">
          Live call to TypeSafe&apos;s{" "}
          <span className="mono">jev-latest</span> — five typed questions in
          one parallel pass, then code routes the ticket from calibrated
          probabilities.
        </p>
        <div className="status-row">
          <span
            className={`pill ${configured ? "pill-live" : configured === false ? "pill-warn" : "pill-muted"}`}
          >
            {configured === null
              ? "Checking key…"
              : configured
                ? "API key loaded"
                : "Set TYPESAFE_API_KEY"}
          </span>
          <span className="pill pill-muted mono">POST /v1/systemone</span>
        </div>
      </header>

      <section className="workspace">
        <div className="panel input-panel">
          <div className="panel-head">
            <h2>Ticket</h2>
            <p>Pick a sample or paste your own message.</p>
          </div>

          <div className="sample-row" role="list">
            {SAMPLE_TICKETS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                role="listitem"
                className={`sample-chip ${activeSample === sample.id ? "active" : ""}`}
                onClick={() => loadSample(sample.id)}
              >
                {sample.label}
              </button>
            ))}
          </div>

          <label className="field">
            <span>Channel</span>
            <input
              value={channel}
              onChange={(e) => {
                setChannel(e.target.value);
                setActiveSample("");
              }}
              placeholder="email, chat, in-app…"
            />
          </label>

          <label className="field">
            <span>Message</span>
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setActiveSample("");
              }}
              rows={8}
              spellCheck
            />
          </label>

          <div className="actions">
            <button
              type="button"
              className="primary"
              onClick={runTriage}
              disabled={isPending || !message.trim()}
            >
              {isPending ? "Evaluating with Jev…" : "Evaluate with Jev"}
            </button>
            {result ? (
              <span className="mono meta">
                {result.latencyMs} ms · {result.usage.input_tokens} in /{" "}
                {result.usage.output_tokens} out · {result.model}
              </span>
            ) : null}
          </div>

          {error ? <p className="error">{error}</p> : null}
          {configured === false ? (
            <p className="hint">
              Create <span className="mono">.env.local</span> with{" "}
              <span className="mono">TYPESAFE_API_KEY=sk-...</span> then restart{" "}
              <span className="mono">npm run dev</span>.
            </p>
          ) : null}
        </div>

        <div className="panel results-panel">
          <div className="panel-head">
            <h2>Jev answers</h2>
            <p>Noul · Choice · Score — same state, parallel evaluation.</p>
          </div>

          {!result ? (
            <div className="empty">
              <p>
                Results appear here after a live API call. Expect ~70–500 ms for
                all five questions.
              </p>
            </div>
          ) : (
            <div className="results">
              <div className={`decision ${actionTone(result.decision.action)}`}>
                <div className="decision-top">
                  <span className="decision-label">{result.decision.label}</span>
                  <span className="mono">{result.decision.slaMinutes}m SLA</span>
                </div>
                <p className="decision-queue">{result.decision.queue}</p>
                <p className="decision-reason mono">{result.decision.reason}</p>
              </div>

              <article className="answer-block">
                <header>
                  <span className="tag">choice</span>
                  <h3>department → {result.answers.department.choice}</h3>
                  <span className="mono">
                    conf {formatPct(result.answers.department.confidence)}
                  </span>
                </header>
                {Object.entries(result.answers.department.probabilities)
                  .sort((a, b) => b[1] - a[1])
                  .map(([key, value]) => (
                    <ProbabilityMeter key={key} label={key} value={value} />
                  ))}
              </article>

              <article className="answer-block">
                <header>
                  <span className="tag">score</span>
                  <h3>
                    frustration → {result.answers.frustration.score.toFixed(2)}
                  </h3>
                  <span className="mono">
                    conf {formatPct(result.answers.frustration.confidence)}
                  </span>
                </header>
                {Object.entries(result.answers.frustration.probabilities)
                  .sort((a, b) => Number(a[0]) - Number(b[0]))
                  .map(([key, value]) => (
                    <ProbabilityMeter
                      key={key}
                      label={`${key}: ${result.answers.frustration.legend[key] ?? ""}`}
                      value={value}
                      accent="var(--accent-2)"
                    />
                  ))}
              </article>

              <div className="noul-grid">
                {(
                  [
                    ["is_urgent", result.answers.is_urgent.noul],
                    ["refund_requested", result.answers.refund_requested.noul],
                    ["needs_human", result.answers.needs_human.noul],
                  ] as const
                ).map(([key, value]) => (
                  <article key={key} className="answer-block compact">
                    <header>
                      <span className="tag">noul</span>
                      <h3>{key}</h3>
                    </header>
                    <p className="noul-value mono">{formatPct(value)}</p>
                    <ProbabilityMeter label="P(yes)" value={value} />
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <footer className="footer">
        <p>
          Built on{" "}
          <a href="https://docs.typesafe.ai" target="_blank" rel="noreferrer">
            TypeSafe System One
          </a>
          . Jev cannot hallucinate free-form text — answers stay inside your
          schema. Routing policy lives in{" "}
          <span className="mono">src/lib/routing.ts</span>.
        </p>
      </footer>
    </div>
  );
}
