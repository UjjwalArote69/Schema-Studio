import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

/**
 * Returns the correct Stripe Price ID based on the billing interval.
 */
export function getStripePriceId(interval: "monthly" | "yearly"): string {
  if (interval === "yearly") {
    return process.env.STRIPE_PRO_YEARLY_PRICE_ID!;
  }
  return process.env.STRIPE_PRO_MONTHLY_PRICE_ID!;
}