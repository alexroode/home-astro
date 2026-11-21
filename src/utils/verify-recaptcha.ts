
import { RECAPTCHA_SECRET_KEY } from "astro:env/server";

const recaptchaURL = "https://www.google.com/recaptcha/api/siteverify";
const requestHeaders = {
    "Content-Type": "application/x-www-form-urlencoded"
};
const recaptchaThreshold = 0.5;

export async function verifyRecaptcha(recaptchaResponse?: string): Promise<boolean> {
    if (!recaptchaResponse) {
        return false;
    }

    const requestBody = new URLSearchParams({
        secret: RECAPTCHA_SECRET_KEY,
        response: recaptchaResponse
    });
  
    const response = await fetch(recaptchaURL, {
        method: "POST",
        headers: requestHeaders,
        body: requestBody.toString()
    });

    const { score } = await response.json();

    return score >= recaptchaThreshold;
}