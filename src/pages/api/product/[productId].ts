import type { APIRoute } from "astro";
import { getAllProducts } from "../../../utils/product-utils";

const products = await getAllProducts(import.meta.env.PROD);

export async function getStaticPaths() {
    return products.map(product => ({
        params: { productId: product.id }
    }));
}

export const GET: APIRoute = async ({ params }) => {
    if (!params.productId) {
        return new Response(null, { status: 404 });
    }

    const product = products.find(product => product.id === params.productId);

    if (!product) {
        return new Response(null, { status: 404 });
    }
  
    return new Response(JSON.stringify(product), { status: 200 });
}