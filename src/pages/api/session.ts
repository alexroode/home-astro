import type { APIRoute } from "astro";
import type { CartDetails } from "use-shopping-cart/core";
import { getProduct, getStripeApi } from "../../utils/product-utils";

export const prerender = false;

export const POST: APIRoute = async ({ request, url }) => {
    const cartDetails: CartDetails = await request.json();
    const stripe = getStripeApi();
    const rootUrl = url.origin;

    const productIds = Object.keys(cartDetails);
    let validatedItems = [];
    for (const id of productIds) {
        const inventoryProduct = await getProduct(id);
    
        if (!inventoryProduct) {
            throw new Error(`Invalid Cart: product with id "${id}" is not in your inventory.`);
        }
        validatedItems.push({
            quantity: cartDetails[id].quantity,
            price: inventoryProduct.id
        });
    }

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            success_url: new URL("/thank-you?session_id={CHECKOUT_SESSION_ID}", rootUrl).toString(),
            cancel_url: new URL("/cart", rootUrl).toString(),
            line_items: validatedItems,
            custom_fields: [
                {
                    key: "organization",
                    type: "text",
                    label: {
                        type: "custom",
                        custom: "Name of your school / organization"
                    }
                }
            ]
        });
    
        return new Response(JSON.stringify({
            sessionId: session.id
        }), { status: 200});

    } catch (error) {
        console.log("An error occurred communicating with Stripe", error);
        return new Response(null, { status: 500});
    }
}