import { Stripe } from "stripe";
import { STRIPE_SECRET_KEY } from "astro:env/server";
import { Music } from "../services/music-service.js"
import type { Product } from "../types.js";

export function getStripeApi() {
    return new Stripe(STRIPE_SECRET_KEY, {
        apiVersion: "2023-10-16",
    });
}

export async function getAllProducts(isProduction: boolean): Promise<Product[]> {
    const api = getStripeApi();
    const priceResponse = await api.prices.list({ limit: 100, expand: ["data.product"] });
    const musicLibrary = await Music.getLibrary();
    
    const products = musicLibrary.pieces
        .flatMap(piece => piece.products)
        .filter(price => price?.prod === isProduction)
        .flatMap(stripePriceReference => {
            if (!stripePriceReference) {
                return [];
            }
            const price = priceResponse.data.find(p => stripePriceReference.priceId === p.id);
            if (!price) {
                return [];
            }
            
            const product = price.product as Stripe.Product;
            return {
                id: price.id,
                currency: price.currency,
                price: price.unit_amount || 0,
                name: product.name,
                description: product.description || "",
                localName: stripePriceReference.name
            };
        });

    productsCache = products;
    return products;
}

let productsCache: Product[] = [];
export async function getProduct(productId: string): Promise<Product | undefined> {
    if (productsCache.length === 0) {
        const isStripeLive = STRIPE_SECRET_KEY.startsWith("sk_live_");
        productsCache = await getAllProducts(isStripeLive);
    }
    return productsCache.find(product => product.id === productId);
}