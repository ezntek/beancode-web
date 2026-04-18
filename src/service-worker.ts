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

import { WANTED_PYODIDE_VERSION } from './lib/version';
import { build, files, version } from '$service-worker';
const self = globalThis.self as unknown as ServiceWorkerGlobalScope;

const CACHE = `beancode-web-${version}-py${WANTED_PYODIDE_VERSION}`
const ASSETS = [
    ...build, ...files
];
const PYODIDE_ASSETS = [
    '/pyodide_stdlib.zip',
    '/pyodide.asm.wasm',
    '/pyodide.asm.js',
];

self.addEventListener('install', (event) => {
    async function add() {
        const cache = await caches.open(CACHE);
        await cache.addAll(ASSETS);

        // just in case
        const pyodideAssets = PYODIDE_ASSETS.filter((f) => !ASSETS.includes(f));
        await Promise.allSettled(
            pyodideAssets.map(async (path) => {
                const response = await fetch(path);
                if (response.ok)
                    await cache.put(path, response);
            })
        );
    }

    event.waitUntil(add());
    self.skipWaiting(); 
});

self.addEventListener('activate', (event) => {
	// Remove previous cached data from disk
	async function removeOld() {
		for (const key of await caches.keys()) {
			if (key !== CACHE) await caches.delete(key);
		}
	}

	event.waitUntil(removeOld());
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET')
        return;

    async function respond() {
        const url = new URL(e.request.url);
        const cache = await caches.open(CACHE);

       if (ASSETS.includes(url.pathname)) {
            const response = await cache.match(url.pathname);
            if (response)
                return response;
        }

        if (PYODIDE_ASSETS.includes(url.pathname)) {
            const cached = await cache.match(url.pathname);
            if (cached)
                return cached;

            const response = await fetch(e.request) 

			if (!(response instanceof Response))
				throw new Error('invalid response from fetch');

            if (response.status === 200)
                await cache.put(url.pathname, response.clone());

            return response;
        }

        try {
			const response = await fetch(e.request);

			// if we're offline, fetch can return a value that is not a Response
			// instead of throwing - and we can't pass this non-Response to respondWith
			if (!(response instanceof Response))
				throw new Error('invalid response from fetch');

			if (response.status === 200)
				cache.put(e.request, response.clone());

			return response;
		} catch (err) {
			const response = await cache.match(e.request);

			if (response) 
				return response;

			// if there's no cache, then just error out
			// as there is nothing we can do to respond to this request
			throw err;
		}
	}

    e.respondWith(respond());
});
