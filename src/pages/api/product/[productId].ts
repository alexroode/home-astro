import type { APIRoute } from "astro";
import { getProduct } from "../../../utils/product-utils";

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
    if (!params.productId) {
        return new Response(null, { status: 404 });
    }

    const product = await getProduct(params.productId);

    if (!product) {
        return new Response(null, { status: 404 });
    }
  
    return new Response(JSON.stringify(product), { status: 200 });
}