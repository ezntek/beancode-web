<script lang="ts">
	import { THEME_NAMES, THEMES } from '$lib/themes/themes';

	interface IProps {
		label: string;
		value: string;
		onChange: (theme: string) => void;
	}

	let { label, value, onChange }: IProps = $props();
</script>

<tr>
	<td><span class="label">{label}</span></td>
	<td>
		<select
			class="picker"
			style="flex: 1;"
			bind:value
			onchange={(e) => onChange(e.currentTarget.value)}
		>
			{#each Object.keys(THEMES) as theme}
				<option value={theme} selected={value === theme}>
					{(THEME_NAMES as any)[theme]}
				</option>
			{/each}
		</select>
	</td>
</tr>

<style>
	.picker {
		font-family: 'IBM Plex Mono', monospace !important;
		font-size: 1.1em;
		border-width: 0px;
		border-radius: 3px;
		background-color: var(--bw-surface1);
		color: var(--bw-text);
		font-weight: bold;
		width: 100%;
		margin-bottom: 0.3em;
	}

	.label {
		color: var(--bw-text);
		margin: 0;
		margin-right: 0.8em;
		padding: 0;
	}
</style>
