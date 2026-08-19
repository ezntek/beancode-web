<script lang="ts">
	let { children } = $props();
	import { BEANCODE_IS_DEV_BUILD } from '$lib/constants';
	import '../app.css';

	// update the service worker if a new one is installed.
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.addEventListener('controllerchange', () => {
			window.location.reload();
		});
	}
</script>

<svelte:head>
	<title>Beancode Web{BEANCODE_IS_DEV_BUILD ? ' (local dev build)' : ''}</title>
</svelte:head>

{@render children()}

<style>
</style>
