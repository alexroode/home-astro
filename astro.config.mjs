import { defineConfig } from 'astro/config';
import react from "@astrojs/react";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  // Keep Astro 4's whitespace handling; Astro 7's default ('jsx') drops spaces between inline elements on separate lines.
  compressHTML: true,
  adapter: node({
    mode: "standalone"
  })
});