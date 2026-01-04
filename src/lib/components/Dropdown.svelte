<!--
 Beancode Web

 Copyright (c) 2026-present Eason Qin <eason@ezntek.com>

 This Source Code Form is subject to the terms of the Mozilla Public
 license, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at https://mozilla.org/MPL/2.0/.
-->

<script lang="ts">
	import { onMount } from 'svelte';

	interface IProps {
		x: number;
		y: number;
		onClose: Function;
		children: any;
	}
	let { x, y, onClose, children }: IProps = $props();

	let dropdownElement: HTMLDivElement;
	let portalContainer: HTMLDivElement;

	onMount(() => {
		portalContainer = document.createElement('div');
		portalContainer.className = 'dropdown-portal-container';
		document.body.appendChild(portalContainer);
		portalContainer.appendChild(dropdownElement);

		function handleClickAway(e: MouseEvent) {
			if (dropdownElement && !dropdownElement.contains(e.target as Node)) {
				onClose();
			}
		}

		function handleMoveAway(e: MouseEvent) {
			const LEEWAY = 30;
			const rect = dropdownElement.getBoundingClientRect();
			const notInBounds =
				e.clientX < rect.left - LEEWAY ||
				e.clientX > rect.right + LEEWAY ||
				e.clientY < rect.top - LEEWAY ||
				e.clientY > rect.bottom + LEEWAY;
			if (dropdownElement && notInBounds) {
				onClose();
			}
		}

		setTimeout(() => {
			document.addEventListener('click', handleClickAway);
			document.addEventListener('mousemove', handleMoveAway);
		}, 0);

		return () => {
			document.removeEventListener('click', handleClickAway);
			document.removeEventListener('mousemove', handleMoveAway);
			if (portalContainer && portalContainer.parentNode) {
				portalContainer.parentNode.removeChild(portalContainer);
			}
		};
	});
</script>

<div class="dropdown" bind:this={dropdownElement} style="left: {x}px; top: {y}px;">
	{@render children()}
</div>

<style>
	.dropdown {
		position: fixed;
		background: var(--bw-base3);
		border: 1px solid var(--bw-surface2);
		border-radius: 6px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		z-index: 9999;
		padding: 0.25em;
		min-width: 140px;
	}

	.dropdown :global(button) {
		display: flex;
		align-items: center;
		gap: 0.5em;
		width: 100%;
		padding: 0.5em 0.75em;
		background: transparent;
		border: none;
		color: var(--bw-text);
		font-family: 'Inter', sans-serif;
		font-size: 0.9em;
		text-align: left;
		cursor: pointer;
		border-radius: 4px;
		transition:
			background 130ms ease,
			font-weight 130ms ease;
	}

	.dropdown :global(button:hover) {
		background: var(--bw-surface1);
		font-weight: bold;
	}

	.dropdown :global(button span) {
		width: 1em;
		font-size: 0.85em;
	}
</style>
