import { defineConfig, envField } from 'astro/config';
import react from "@astrojs/react";

import node from "@astrojs/node";

const secret = () => envField.string({ context: "server", access: "secret" });
const publicKey = () => envField.string({ context: "client", access: "public" });

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  // Keep Astro 4's whitespace handling; Astro 7's default ('jsx') drops spaces between inline elements on separate lines.
  compressHTML: true,
  // Trust the host and protocol Caddy forwards, so Astro.url (and Stripe's return URLs) use the public address.
  security: {
    allowedDomains: [
      { protocol: "https", hostname: "alexander-roode.com" },
      { protocol: "https", hostname: "www.alexander-roode.com" },
      { protocol: "https", hostname: "dev.alexander-roode.com" },
    ]
  },
  adapter: node({
    mode: "standalone"
  }),
  // Server secrets are read from the environment at runtime; client keys are baked in at build time.
  env: {
    schema: {
      STRIPE_PUBLISHABLE_KEY: publicKey(),
      RECAPTCHA_SITE_KEY: publicKey(),
      STRIPE_SECRET_KEY: secret(),
      STRIPE_WEBHOOK_SECRET: secret(),
      RECAPTCHA_SECRET_KEY: secret(),
      MAILGUN_API_KEY: secret(),
      MAILGUN_DOMAIN: secret(),
      CONTACT_TO_EMAIL: secret(),
      AIRTABLE_API_KEY: secret(),
      AIRTABLE_BASE_ID: secret(),
      AIRTABLE_ORDERS_TABLE_NAME: secret(),
      AIRTABLE_PRODUCTS_TABLE_NAME: secret(),
      ORDER_DOWNLOADS_ROOT_PATH: secret(),
    }
  }
});
