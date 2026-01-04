<script lang="ts">
	import { onMount } from 'svelte';
	let { children } = $props();
	import '../app.css';
	onMount(() => {
		if ('serviceWorker' in navigator) {
			// https://dev.to/stefnotch/enabling-coop-coep-without-touching-the-server-2d3n
			//
			navigator.serviceWorker.register('/sw.js').then(
				function (registration) {
					console.log('COOP/COEP Service Worker registered', registration.scope);
					// If the registration is active, but it's not controlling the page
					if (registration.active && !navigator.serviceWorker.controller) {
						window.location.reload();
					}
				},
				function (err) {
					console.log('COOP/COEP Service Worker failed to register', err);
				}
			);
		} else {
			console.warn('Cannot register a service worker');
		}
	});
</script>

<svelte:head>
	<title>Beancode Web</title>
</svelte:head>

{@render children()}

<style>
</style>
