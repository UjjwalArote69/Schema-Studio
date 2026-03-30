// ============================================================
// FILE: src/app/api/stripe/checkout/route.ts
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, getStripePriceId } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate the user
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get the billing interval from the request body
    const body = await req.json();
    const interval = body.interval === "yearly" ? "yearly" : "monthly";

    // 3. Look up the user in the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 4. If already on Pro, don't allow another checkout
    if (user.plan === "pro") {
      return NextResponse.json(
        { error: "You are already on the Pro plan." },
        { status: 400 }
      );
    }

    // 5. Create or retrieve the Stripe customer
    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: { userId: user.id },
      });
      stripeCustomerId = customer.id;

      // Save the Stripe customer ID to the database
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId },
      });
    }

    // 6. Create a Stripe Checkout Session
    const priceId = getStripePriceId(interval);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/settings?tab=billing&upgraded=true`,
      cancel_url: `${appUrl}/settings?tab=billing&canceled=true`,
      metadata: {
        userId: user.id,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
        },
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("STRIPE_CHECKOUT_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session." },
      { status: 500 }
    );
  }
}