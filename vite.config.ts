import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
    optimizeDeps: {
        include: ['@xterm/xterm', '@xterm/addon-fit', '@xterm/addon-search'],
    }
});
