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
		<span>{@render children()}</span>
	</button>
	{#if !cwdDisplay}
		<div class="actions">
			<button aria-label="rename" class="rename" onclick={() => onRename()}>
				<span class="fa-solid fa-pencil"> </span>
			</button>
			<button aria-label="delete" class="delete" onclick={() => onDelete()}>
				<span class="fa-solid fa-trash" style="color: var(--bw-red)"></span>
			</button>
		</div>
	{/if}
</div>

<style>
	.item {
		display: flex;
		position: relative;
		margin: 0.4em;
		margin-left: 0.5em;
		margin-right: 0.5em;
		border-radius: 0.15em;
		overflow: hidden;
	}
	.button {
		flex: 1;
		min-width: 0;
		border: 0;
		padding: 0.3em 0.3em 0.3em 0.5em;
		text-align: left;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 1em;
		background-color: var(--bw-base3);
		color: var(--bw-text);
		overflow: hidden;
	}

	.button > span {
		display: block;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.actions {
		position: absolute;
		top: 0;
		right: 0;
		height: 100%;
		width: 3.2em;
		display: flex;
		align-items: center;
		justify-content: space-evenly;
		background-color: var(--bw-base3);
		pointer-events: none;
		opacity: 0;
	}
	.actions > button {
		opacity: 0;
	}
	.item:hover .actions {
		background-color: var(--bw-surface1);
		opacity: 1;
		pointer-events: auto;
	}
	.item:hover .actions > button {
		opacity: 1;
	}
	.rename,
	.delete {
		border: 0;
		background: none;
		color: var(--bw-text);
		cursor: pointer;
		padding: 0;
	}

	.item:hover {
		background-color: var(--bw-surface1) !important;
	}

	.item:hover > :global(button) {
		background-color: var(--bw-surface1) !important;
	}
</style>
