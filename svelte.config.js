// Tauri doesn't have a Node.js server to do proper SSR
// so we will use adapter-static to prerender the app (SSG)
// See: https://v2.tauri.app/start/frontend/sveltekit/ for more info
import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
  },
  onwarn: (warning, handler) => {
    // suppress warnings on `vite dev` and `vite build`; but even without this, things still work
    if (
      [
        "a11y-click-events-have-key-events",
        "a11y-no-static-element-interactions",
        "a11y-autofocus",
      ].includes(warning.code)
    )
      return;
    handler(warning);
  },
};

export default config;
