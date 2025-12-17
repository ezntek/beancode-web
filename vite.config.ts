import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
    server: {
        headers: {
          "Cross-Origin-Embedder-Policy": "require-corp",
        }
    },
    optimizeDeps: {
        include: [
            '@xterm/xterm', '@xterm/addon-fit', '@xterm/addon-search',
            "svelte-codemirror-editor", "codemirror", "@codemirror/language-javascript",
            "@codemirror/theme-one-dark"
        ],
    },
});
