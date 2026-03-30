// ============================================================
// FILE: src/app/api/stripe/webhook/route.ts
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      // ─── Payment successful, subscription created ─────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          const userId =
            session.metadata?.userId ||
            subscription.metadata?.userId;

          if (!userId) {
            console.error("No userId found in checkout session metadata");
            break;
          }

          const item = subscription.items.data[0];
        const periodEnd = item?.current_period_end ?? Math.floor(Date.now() / 1000);

          await prisma.user.update({
            where: { id: userId },
            data: {
              plan: "pro",
              stripeSubscriptionId: subscription.id,
              stripeCustomerId:
                typeof subscription.customer === "string"
                  ? subscription.customer
                  : subscription.customer.id,
              stripePriceId: subscription.items.data[0]?.price?.id ?? null,
              stripeCurrentPeriodEnd: new Date(periodEnd * 1000),
            },
          });

          console.log(`✅ User ${userId} upgraded to Pro`);
        }
        break;
      }

      // ─── Subscription renewed, plan changed, etc. ─────────
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

        // Find the user — try metadata first, then fall back to stripeCustomerId
        let userId = subscription.metadata?.userId;

        if (!userId) {
          const user = await prisma.user.findUnique({
            where: { stripeCustomerId: customerId },
            select: { id: true },
          });
          if (!user) {
            console.error("No user found for subscription update");
            break;
          }
          userId = user.id;
        }

        const isActive =
          subscription.status === "active" ||
          subscription.status === "trialing";

        // Get period end from the subscription item
          const item = subscription.items.data[0];
          const periodEnd = item?.current_period_end ?? Math.floor(Date.now() / 1000);

        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: isActive ? "pro" : "free",
            stripePriceId: subscription.items.data[0]?.price?.id ?? null,
            stripeCurrentPeriodEnd: new Date(periodEnd * 1000),
          },
        });

        console.log(
          `🔄 User ${userId} subscription updated — status: ${subscription.status}`
        );
        break;
      }

      // ─── Subscription canceled / expired ──────────────────
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

        // Find the user by metadata, stripeSubscriptionId, or stripeCustomerId
        let user = subscription.metadata?.userId
          ? await prisma.user.findUnique({
              where: { id: subscription.metadata.userId },
              select: { id: true },
            })
          : null;

        if (!user) {
          user = await prisma.user.findUnique({
            where: { stripeSubscriptionId: subscription.id },
            select: { id: true },
          });
        }

        if (!user) {
          user = await prisma.user.findUnique({
            where: { stripeCustomerId: customerId },
            select: { id: true },
          });
        }

        if (!user) {
          console.error("No user found for subscription deletion");
          break;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            plan: "free",
            stripeSubscriptionId: null,
            stripePriceId: null,
            stripeCurrentPeriodEnd: null,
          },
        });

        console.log(`❌ User ${user.id} downgraded to Free`);
        break;
      }

      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}