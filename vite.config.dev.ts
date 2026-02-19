import { sveltekit } from '@sveltejs/kit/vite';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
        sveltekit(),
        {
            name: 'configure-response-headers',
            configureServer: (server) => {
                server.middlewares.use((_req, res, next) => {
                    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
                    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
                    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
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
        https: {
          key: readFileSync('./localhost+3-key.pem'),
          cert: readFileSync('./localhost+3.pem')
        }
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
