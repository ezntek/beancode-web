import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { execSync } from 'child_process';

export default defineConfig({
	plugins: [
        sveltekit(),
        {
            name: 'configure-response-headers',
            configureServer: (server) => {
                server.middlewares.use((_req, res, next) => {
                    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
                    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
                    next();
                });
            }
        }
    ],
    server: {
        host: true,
        headers: {
            "Cross-Origin-Embedder-Policy": "require-corp",
            "Cross-Origin-Opener-Policy": "same-origin"
        },
    },
    define: {
        __COMMIT_HASH__: JSON.stringify(execSync('git rev-parse --short HEAD').toString().trim()),
    },
    optimizeDeps: {
        include: [
            '@xterm/xterm',
            '@xterm/addon-fit',
            '@xterm/addon-search',
            'codemirror',
            '@codemirror/commands',
            '@codemirror/language',
            '@codemirror/state',
            '@codemirror/view',
            '@codemirror/lang-python',
            '@codemirror/theme-one-dark',
            //'@lezer/highlight',
            //'@lezer/lr',
        ],
        exclude: [
        ]
    },
});
