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
	}
</style>
