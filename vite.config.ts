import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { execSync } from 'child_process';
//import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
	plugins: [
        sveltekit(),
        //mkcert(),
        {
            name: 'configure-response-headers',
            configurePreviewServer: (server) => {
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
            "Cross-Origin-Opener-Policy": "same-origin",
            'Cross-Origin-Resource-Policy': 'cross-origin',
        },
    },
    preview: {
        host: true,
        headers: {
            "Cross-Origin-Embedder-Policy": "require-corp",
            "Cross-Origin-Opener-Policy": "same-origin",
            'Cross-Origin-Resource-Policy': 'cross-origin',
        },
    },
    define: {
        __COMMIT_HASH__: JSON.stringify(execSync('git rev-parse --short HEAD').toString().trim()),
        __DEV__: false,
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
