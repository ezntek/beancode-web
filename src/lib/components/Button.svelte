<script lang="ts">
	import { type Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		onclick?: () => void;
	}
	let { children, onclick, ...rest }: Props = $props();
</script>

<button class="bw-button" {onclick} {...rest}>
	{@render children()}
</button>

<style>
	.bw-button {
		font-family: 'Inter', sans-serif;
		font-size: 13pt;
		background-color: var(--bw-surface1);
		color: var(--bw-text);
		border: 1px solid var(--bw-surface3);
		padding: 0.3em;
		margin: 0.2em;
		border-radius: 0.5em;
	}
</style>
