import type { ContactRequest } from "../types";
import Mailgun from "mailgun.js";
import formData from "form-data";
import { MAILGUN_API_KEY, CONTACT_TO_EMAIL, MAILGUN_DOMAIN } from "astro:env/server";

export async function notifyAdmin(contactRequest: ContactRequest): Promise<Response> {
    const mailgun = new Mailgun(formData);
    const mailgunClient = mailgun.client({ key: MAILGUN_API_KEY, username: "api" });
  
    const message = {
        to: [CONTACT_TO_EMAIL],
        from: "Contact Form <contact@alexander-roode.com>",
        subject: "Contact Form Submission",
        html: `<strong>Name</strong>: ${contactRequest.name}<br/>` +
        `<strong>Email</strong>: ${contactRequest.email}<br/>` +
        `<strong>Message</strong>: <br/><p>${contactRequest.message}</p>`
    };
  
    try {
        await mailgunClient.messages.create(MAILGUN_DOMAIN, message);

        return new Response(null, { status: 204 });
    } catch (error) {
        console.error(error);
        return new Response(null, { status: 500 });
    }
}