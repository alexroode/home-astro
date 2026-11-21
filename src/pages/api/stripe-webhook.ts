import type { APIRoute } from "astro";
import { STRIPE_WEBHOOK_SECRET } from "astro:env/server";
import type Stripe from "stripe";
import { getStripeApi } from "../../utils/product-utils";
import { createAirtableOrder } from "../../utils/airtable";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    const stripe = getStripeApi();
    const signature = request.headers.get("stripe-signature");
    let event: Stripe.Event;

    const body = await request.text();

    try {
        event = stripe.webhooks.constructEvent(body, signature || "", STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.log("Webhook error", err);
        return new Response(`Webhook Error: ${err}`, { status: 400 });
    }
  
    if (event.type === "payment_intent.succeeded") {
        await handleNewPaymentIntent(event.data.object as Stripe.PaymentIntent);
    }
  
    return new Response(JSON.stringify({ received: true }), { status: 200 });
}

async function handleNewPaymentIntent(paymentIntent: Stripe.PaymentIntent) {
    await createAirtableOrder(paymentIntent);
}