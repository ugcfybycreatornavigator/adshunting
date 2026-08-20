export const BILLING_CONFIG = {
  pro: {
    name: "Ads Hunting Pro",
    amountPaise: 49900,
    amountDisplay: 499,
    currency: "INR",
    interval: "monthly",
    trialDays: 7,
  },
} as const;

export type PlanKey = keyof typeof BILLING_CONFIG;
