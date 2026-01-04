<script lang="ts">
	let { children } = $props();
	import '../app.css';
</script>

<svelte:head>
	<title>Beancode Web</title>
</svelte:head>

{@render children()}

<style>
</style>
