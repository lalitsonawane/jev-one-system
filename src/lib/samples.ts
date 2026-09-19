export type SampleTicket = {
  id: string;
  label: string;
  channel: string;
  message: string;
};

export const SAMPLE_TICKETS: SampleTicket[] = [
  {
    id: "stripe-fail",
    label: "Stripe connect failing",
    channel: "email",
    message:
      "Hi, I've been trying to connect my Stripe account for 3 days and it keeps failing. I'm losing sales. Please help ASAP.",
  },
  {
    id: "double-charge",
    label: "Double charge",
    channel: "chat",
    message:
      "My card was charged twice for invoice #48192. I need a refund for the duplicate charge. Order was placed yesterday.",
  },
  {
    id: "pricing",
    label: "Enterprise pricing",
    channel: "sales form",
    message:
      "We're evaluating your Pro plan for a 40-person team. Can someone walk us through annual pricing and SSO options?",
  },
  {
    id: "calm-bug",
    label: "Calm bug report",
    channel: "in-app",
    message:
      "When I export a CSV of last month's invoices, the date column shows UTC instead of my workspace timezone. Steps: Settings → Exports → Download CSV.",
  },
  {
    id: "angry-outage",
    label: "Angry outage",
    channel: "twitter DM",
    message:
      "YOUR ENTIRE DASHBOARD IS DOWN AGAIN. Customers can't check out. This is the third time this month. Fix it NOW or we're canceling.",
  },
];
