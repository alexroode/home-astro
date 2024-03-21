import type { APIRoute } from "astro";
import type { ContactRequest } from "../../types";

export const prerender = false;

const recaptchaURL = 'https://www.google.com/recaptcha/api/siteverify';
const requestHeaders = {
    'Content-Type': 'application/x-www-form-urlencoded'
};

async function verifyRecaptcha(recaptchaResponse?: string): Promise<boolean> {
    if (!recaptchaResponse) {
        return false;
    }

    const requestBody = new URLSearchParams({
        secret: "YOUR_SITE_SECRET_KEY",
        response: recaptchaResponse
    });
  
    const response = await fetch(recaptchaURL, {
        method: "POST",
        headers: requestHeaders,
        body: requestBody.toString()
    });

    const json = await response.json();

    console.log(json);
  
    return true;
}

export const POST: APIRoute = async ({ request }) => {
    const data: ContactRequest = await request.json();
  
    const isRecaptchaValid = await verifyRecaptcha(data.recaptchaResponse);

    if (!isRecaptchaValid) {
        return new Response(JSON.stringify({}), { status: 400 });
    }

    return new Response(JSON.stringify({}), { status: 200 });
}