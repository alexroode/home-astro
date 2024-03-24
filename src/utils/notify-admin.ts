import type { ContactRequest } from "../types";
import Mailgun from "mailgun.js";
import config from "config";
import formData from "form-data";

const mailgunApiKey = config.get<string>("mailgunApiKey");

export async function notifyAdmin(contactRequest: ContactRequest): Promise<Response> {
    const mailgun = new Mailgun(formData);
    const mailgunClient = mailgun.client({ key: mailgunApiKey, username: "api" });
  
    const message = {
        to: [import.meta.env.CONTACT_TO_EMAIL],
        from: "Contact Form <contact@alexander-roode.com>",
        subject: "Contact Form Submission",
        html: `<strong>Name</strong>: ${contactRequest.name}<br/>` +
        `<strong>Email</strong>: ${contactRequest.email}<br/>` +
        `<strong>Message</strong>: <br/><p>${contactRequest.message}</p>`
    };
  
    try {
        await mailgunClient.messages.create(import.meta.env.MAILGUN_DOMAIN, message);

        return new Response(null, { status: 204 });
    } catch (error) {
        console.error(error);
        return new Response(null, { status: 500 });
    }
}