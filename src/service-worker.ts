/// NOTE: most code is graciously taken, then adapted from the Svelte docs.
// https://svelte.dev/docs/kit/service-workers
//
// Disables access to DOM typings like `HTMLElement` which are not available
// inside a service worker and instantiates the correct globals
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

// Ensures that the `$service-worker` import has proper type definitions
/// <reference types="@sveltejs/kit" />

// Only necessary if you have an import from `$env/static/public`
/// <reference types="../.svelte-kit/ambient.d.ts" />
//
/// NOTE: A portion of this code is also LLM-assisted; it is therefore
// licensed under the public domain, as part of this code is not mine.

import { WANTED_PYODIDE_VERSION } from './lib/version';
import { build, files, version } from '$service-worker';

const self = globalThis.self as unknown as ServiceWorkerGlobalScope;

const CACHE = `beancode-web-${version}-py${WANTED_PYODIDE_VERSION}`;

// 1. Clean paths without query parameters
const STATIC_ASSETS = new Set([...build, ...files]);
const PYODIDE_ASSETS = new Set([
    '/pyodide_stdlib.zip',
    '/pyodide.asm.wasm',
    '/pyodide.asm.js',
    '/pyodide.mjs',
]);

self.addEventListener('install', (event) => {
    async function add() {
        const cache = await caches.open(CACHE);
        
        // Cache built SvelteKit assets
        await cache.addAll(Array.from(STATIC_ASSETS));

        // Cache Pyodide assets that aren't already in STATIC_ASSETS
        const pyodideToFetch = Array.from(PYODIDE_ASSETS).filter((path) => !STATIC_ASSETS.has(path));
        
        await Promise.allSettled(
            pyodideToFetch.map(async (path) => {
                const response = await fetch(path);
                if (response.ok || response.type === 'opaque') {
                    await cache.put(path, response);
                }
            })
        );
    }

    event.waitUntil(add());
    self.skipWaiting(); 
});

self.addEventListener('activate', (event) => {
    async function removeOld() {
        for (const key of await caches.keys()) {
            if (key !== CACHE) await caches.delete(key);
        }
    }

    event.waitUntil(removeOld());
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;

    async function respond(): Promise<Response> {
        const url = new URL(e.request.url);
        const cache = await caches.open(CACHE);
        const pathname = url.pathname;

        // api logic just in case
        if (STATIC_ASSETS.has(pathname) || PYODIDE_ASSETS.has(pathname)) {
            const cached = await cache.match(e.request);
            if (cached) return cached;

            const response = await fetch(e.request);
            if (response.status === 200 || response.type === 'opaque') {
                cache.put(e.request, response.clone());
            }
            return response;
        }

        try {
            const response = await fetch(e.request);
            
            // api logic just in case
            const isApiRoute = pathname.startsWith('/api/');
            if ((response.status === 200 || response.type === 'opaque') && !isApiRoute) {
                cache.put(e.request, response.clone());
            }

            return response;
        } catch (err) {
            const cached = await cache.match(e.request);
            if (cached) return cached;
            throw err;
        }
    }

    e.respondWith(respond());
});
