<script lang="ts">
	interface IProps {
		onClick: Function;
		onInfo?: (e: MouseEvent) => void;
		cwdDisplay?: boolean;
		children: any;
	}
	let { onClick, onInfo = () => {}, cwdDisplay = false, children }: IProps = $props();
	const bgcol = (() => cwdDisplay)() ? '--bw-surface1' : '--bw-base3';
	const bgstyle = `background-color: var(${bgcol});`;
</script>

<div class="item" style={bgstyle}>
	<button class="button" style={bgstyle} onclick={() => onClick()}>
		<span>{@render children()}</span>
	</button>
	<div class="actions">
		<button aria-label="info" class="info" onclick={(e) => onInfo(e)}>
			<span class="fa-solid fa-ellipsis-vertical"></span>
		</button>
	</div>
</div>

<style>
	.item {
		display: flex;
		position: relative;
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
		overflow: hiddee-info;
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
		display: flex;
		margin-right: 0.5em;
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
	.info {
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
