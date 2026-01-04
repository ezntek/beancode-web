import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
        sveltekit(),
        {
            name: 'configure-response-headers',
            configureServer: (server) => {
                server.middlewares.use((_req, res, next) => {
                    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
                    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
                    next();
                });
            }
        }
    ],
    server: {
        host: true,
        headers: {
            "Cross-Origin-Embedder-Policy": "credentialless",
            "Cross-Origin-Opener-Policy": "same-origin"
        },
        //https: {
          //key: readFileSync('./localhost+3-key.pem'),
          //cert: readFileSync('./localhost+3.pem')
        //}
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
