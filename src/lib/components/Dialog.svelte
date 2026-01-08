<!--
 Beancode Web

 Copyright (c) 2026-present Eason Qin <eason@ezntek.com>

 This source code form is licensed under the GNU Affero General Public
 License version 3 (or later). If you cannot locate the LICENSE.md file at
 the root of the project, visit <http://www.gnu.org/licenses/> for more
 information.
-->

<script lang="ts">
	let { children } = $props();

	let dialog: HTMLDialogElement | null = $state(null);

	export function getInnerDialog() {
		return dialog;
	}

	export function open() {
		dialog?.showModal();
	}

	export function close() {
		dialog?.close();
	}

	function handleBackdropClick(e: Event) {
		if (e.target === dialog) {
			close();
		}
	}
</script>

<dialog class="dialog" tabindex="-1" bind:this={dialog} onclick={handleBackdropClick}>
	<div class="dialog-content">
		{@render children()}
	</div>
</dialog>

<style>
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(2px);
		animation: fadeIn 0.2s ease-out;
	}

	dialog[open] {
		animation: appear 180ms ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes appear {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	.dialog {
		padding: 0;
		background-color: var(--bw-base2);
		border: 0px;
		border-radius: 5px;
		min-width: 20vw;
	}
</style>
