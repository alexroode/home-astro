import type { APIRoute } from "astro";
import { getStripeApi } from "../../utils/product-utils";
import type Stripe from "stripe";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
    const stripe = getStripeApi();
    const sessionId = url.searchParams.get("sessionId");

    if (!sessionId) {
        return new Response(null, { status: 200 });
    }

    try {
        const sessionResponse = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["payment_intent"] });
        const lineItemsResponse = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 100 });
        const paymentIntent = sessionResponse.payment_intent as Stripe.PaymentIntent;

        return new Response(
            JSON.stringify({ 
                timestamp: paymentIntent.created, 
                total: sessionResponse.amount_total, 
                items: lineItemsResponse.data 
            }), 
            { status: 200 }
        );
    } catch (error) {
        console.log("An error occurred communicating with Stripe", error);
        return new Response(null, { status: 500 });
    }
}