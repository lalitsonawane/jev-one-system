export type Department = "billing" | "technical" | "sales" | "account";

export type TriageAnswers = {
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
};

export type RouteAction =
  | "auto_route"
  | "priority_queue"
  | "human_review"
  | "refund_playbook";

export type RoutingDecision = {
  action: RouteAction;
  label: string;
  reason: string;
  queue: string;
  slaMinutes: number;
};

/**
 * Code owns the workflow. Jev supplies calibrated judgments;
 * thresholds here are product policy, not model output.
 */
export function decideRoute(answers: TriageAnswers): RoutingDecision {
  const dept = answers.department.choice;
  const deptConfidence = answers.department.confidence;
  const urgent = answers.is_urgent.noul;
  const refund = answers.refund_requested.noul;
  const human = answers.needs_human.noul;
  const frustration = answers.frustration.score;

  if (human > 0.7 || frustration >= 2.5) {
    return {
      action: "human_review",
      label: "Escalate to human",
      reason:
        human > 0.7
          ? `needs_human noul ${human.toFixed(2)} exceeds 0.70`
          : `frustration score ${frustration.toFixed(2)} ≥ 2.5`,
      queue: `${dept} · senior`,
      slaMinutes: 15,
    };
  }

  if (refund > 0.8 && dept === "billing") {
    return {
      action: "refund_playbook",
      label: "Start refund playbook",
      reason: `refund_requested noul ${refund.toFixed(2)} with billing department`,
      queue: "billing · refunds",
      slaMinutes: 30,
    };
  }

  if (deptConfidence < 0.45) {
    return {
      action: "human_review",
      label: "Low-confidence hold",
      reason: `department confidence ${deptConfidence.toFixed(2)} below 0.45`,
      queue: "triage · review",
      slaMinutes: 45,
    };
  }

  if (urgent > 0.85) {
    return {
      action: "priority_queue",
      label: "Priority auto-route",
      reason: `is_urgent noul ${urgent.toFixed(2)} with confidence ${deptConfidence.toFixed(2)}`,
      queue: `${dept} · priority`,
      slaMinutes: 20,
    };
  }

  return {
    action: "auto_route",
    label: "Auto-route",
    reason: `department=${dept} confidence ${deptConfidence.toFixed(2)}`,
    queue: `${dept} · standard`,
    slaMinutes: 240,
  };
}
