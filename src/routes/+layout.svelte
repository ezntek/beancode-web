<script lang="ts">
	let { children } = $props();
	import '../app.css';
</script>

<svelte:head>
	<title>scuffed aah thing</title>
</svelte:head>

{@render children()}

<style>
</style>
