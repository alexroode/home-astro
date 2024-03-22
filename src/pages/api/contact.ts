import type { APIRoute } from "astro";
import type { ContactRequest } from "../../types";
import { verifyRecaptcha } from "../../utils/verify-recaptcha";
import { notifyAdmin } from "../../utils/notify-admin";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    const data: ContactRequest = await request.json();
  
    const isRecaptchaValid = await verifyRecaptcha(data.recaptchaResponse);

    if (!isRecaptchaValid) {
        return new Response(JSON.stringify({}), { status: 400 });
    }

    const response = await notifyAdmin(data);
    return response;
}