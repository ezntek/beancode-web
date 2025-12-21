<script lang="ts">
	let { resize } = $props();
</script>

<div class="resize-handle-outer" onpointerdown={resize}>
	<div class="resize-handle-line">
		<div class="resize-handle-handle"></div>
	</div>
</div>

<style>
	.resize-handle-outer {
		flex: 0 0 auto;
		flex-direction: column;
		position: relative;
		box-sizing: border-box;
		height: 100%;
		width: 8px;
		cursor: col-resize;
		align-items: center;
		justify-content: center;
		display: flex;
		padding-left: 1px;
		padding-right: 1px;
	}

	.resize-handle-line {
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--bw-surface1);
		height: 100%;
		width: 3px;
		border-radius: 1px;
		overflow: visible;
		padding: 0px;
	}

	.resize-handle-handle {
		height: 40px;
		background-color: var(--bw-surface2);
		border-radius: 1px;
		min-width: 4px;
		width: 6px;
		padding: 0px;
	}
</style>
