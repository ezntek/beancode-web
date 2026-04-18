<script lang="ts">
	let { children } = $props();
	import { BEANCODE_IS_DEV_BUILD } from '$lib/version';
	import '../app.css';
</script>

<svelte:head>
	<title>Beancode Web{BEANCODE_IS_DEV_BUILD ? ' (local dev build)' : ''}</title>
</svelte:head>

{@render children()}

<style>
</style>
