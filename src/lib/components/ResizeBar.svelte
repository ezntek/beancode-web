<!--
 Beancode Web

 Copyright (c) 2026-present Eason Qin <eason@ezntek.com>

 This Source Code Form is subject to the terms of the Mozilla Public
 license, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at https://mozilla.org/MPL/2.0/.
-->

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
		margin: 0.16em;
		cursor: col-resize;
		align-items: center;
		justify-content: center;
		display: flex;
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
		min-width: 5px;
		padding: 0px;
	}
</style>
