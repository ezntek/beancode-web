import { sveltekit } from '@sveltejs/kit/vite';
import { execSync } from 'child_process';
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';

let commitHash = '<unknown>';
try {
    commitHash = execSync('git rev-parse --short HEAD').toString().trim();
} catch (e) {
    console.warn('Could not get commit hash:', e);
}

export default defineConfig({
	plugins: [
        sveltekit(),
        mkcert(),
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
        // @ts-ignore
        https: true,
        headers: {
            "Cross-Origin-Embedder-Policy": "require-corp",
            "Cross-Origin-Opener-Policy": "same-origin"
        }
    },
    define: {
        __COMMIT_HASH__: JSON.stringify(commitHash),
        __DEV__: true,
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
            '@battlefieldduck/xterm-svelte'
        ]
    },
});
