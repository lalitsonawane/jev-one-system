import { choice, noul, score } from "@typesafe-ai/sdk";

/**
 * Atomic System One questions for support triage.
 * Asked in one parallel Jev call (speculative fan-out).
 */
export function buildTriageQuestions() {
  return {
    department: choice("Which team should handle this support message?", {
      billing: "Payments, invoicing, refunds, charges, Stripe payouts",
      technical: "Bugs, outages, integrations, product failures",
      sales: "Pricing, upgrades, new accounts, enterprise evaluation",
      account: "Login, access, permissions, workspace settings",
    }),
    frustration: score("How frustrated does the customer appear?", [
      "Calm, just stating facts",
      "Mildly annoyed but civil",
      "Clearly frustrated",
      "Very angry, strong language or threats to cancel",
    ]),
    is_urgent: noul("Does this message convey urgency or time-sensitivity?", {
      true: "Asks for immediate help, mentions losing money/customers, deadlines, or ASAP",
      false: "No deadline and no immediate consequence is mentioned",
    }),
    refund_requested: noul("Does the customer explicitly ask for a refund or chargeback?", {
      true: "Requests money back, refund, or reversal of a charge",
      false: "No request for money back",
    }),
    needs_human: noul(
      "Should a human agent review this before any automated reply or action?",
      {
        true: "Ambiguous, high-stakes, angry, legal, or multi-issue; safer for a person",
        false: "Clear single intent that a routine playbook can handle",
      },
    ),
  } as const;
}

export type TriageQuestions = ReturnType<typeof buildTriageQuestions>;
