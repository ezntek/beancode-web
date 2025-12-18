<script lang="ts">
	import { THEMES, type ThemeSpec } from '$lib/themes/themes';

	const themes = Object.values(THEMES);
	let idx = $state(0);
	const entries = $derived(Object.entries(themes[idx]) as [keyof ThemeSpec, string][]);
	const themeName = $derived(Object.keys(THEMES)[idx]);

	function toggleTheme() {
		idx = (idx + 1) % themes.length;
	}
</script>

<button onclick={toggleTheme}>current theme: {themeName}</button>
<div class="palette">
	{#each entries as [name, value]}
		<div class="swatch" style="background-color: {value}">
			<div class="label">{name}</div>
			<div class="value">{value}</div>
		</div>
	{/each}
</div>

<style>
	.palette {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 1rem;
		padding: 1.5rem;
	}

	.swatch {
		border-radius: 8px;
		padding: 0.75rem;
		min-height: 90px;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
	}

	.label {
		font-size: 0.8rem;
		font-weight: 600;
	}

	.value {
		font-size: 0.75rem;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		opacity: 0.85;
	}
</style>
