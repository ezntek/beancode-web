<script lang="ts">
	interface IProps {
		onClick: Function;
		onRename?: Function;
		onDelete?: Function;
		cwdDisplay?: boolean;
		children: any;
	}
	let {
		onClick,
		onDelete = () => {},
		onRename = () => {},
		cwdDisplay = false,
		children
	}: IProps = $props();
	const bgcol = (() => cwdDisplay)() ? '--bw-surface1' : '--bw-base3';
	const bgstyle = `background-color: var(${bgcol});`;
</script>

<div class="item" style={bgstyle}>
	<button class="button" style={bgstyle} onclick={() => onClick()}>
		{@render children()}
	</button>
	{#if !cwdDisplay}
		<button aria-label="rename" class="rename" onclick={() => onRename()}>
			<span class="fa-solid fa-pencil"> </span>
		</button>
		<button aria-label="delete" class="delete" onclick={() => onDelete()}>
			<span class="fa-solid fa-trash" style="color: var(--bw-red)"></span>
		</button>
	{/if}
</div>

<style>
	.item {
		display: flex;
		margin-left: 0.5em;
		margin-right: 0.5em;
		margin-top: 0.5em;
		border-radius: 0.15em;
		overflow: hidden;
	}
	.delete {
		display: none;
		border-width: 0px;
		background-color: var(--bw-base3);
		color: var(--bw-text);
	}
	.rename {
		display: none;
		border-width: 0px;
		background-color: var(--bw-base3);
		color: var(--bw-text);
	}
	.button {
		word-wrap: break-word;
		margin-right: auto;
		border-radius: 0.15em;
		border-width: 0px;
		padding: 0.3em;
		padding-left: 0.5em;
		text-align: left;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 1em;
		background-color: var(--bw-base3);
		color: var(--bw-text);
		overflow: hidden;
	}
	.item:hover {
		background-color: var(--bw-surface1) !important;
	}
	.item:hover > :global(button) {
		background-color: var(--bw-surface1) !important;
	}
	.item:hover > .delete {
		display: block;
		border-top-right-radius: 0.15em;
		border-bottom-right-radius: 0.15em;
	}
	.item:hover > .rename {
		display: block;
		border-top-right-radius: 0.15em;
		border-bottom-right-radius: 0.15em;
	}
</style>
