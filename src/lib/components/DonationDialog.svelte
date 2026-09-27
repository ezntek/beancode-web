<!--
 Beancode Web

 Copyright (c) 2026-present Eason Qin <eason@ezntek.com>

 This source code form is licensed under the GNU Affero General Public
 License version 3 (or later). If you cannot locate the LICENSE.md file at
 the root of the project, visit <http://www.gnu.org/licenses/> for more
 information.
-->

<script lang="ts">
	import Dialog from './Dialog.svelte';
	import '$lib/styles/dialog.css';

	let innerDialog: Dialog;
	let submitButton: HTMLButtonElement;
	let messages: string[] = $state([]);

	const possibleViews = ['donate', 'why donate'] as const;
	type TView = (typeof possibleViews)[number];

	// yes, we only want the initial state
	let view: TView = $state('donate');

	// @ts-ignore
	export const close = () => {
		innerDialog.close();
	};
	// @ts-ignore
	export const open = () => {
		innerDialog.open();
		setTimeout(() => focus(), 0);
	};

	function selectorStyle(name: string): string {
		if (name === view) return 'selector-selected';
		return '';
	}

	function submitCancel() {
		close();
	}

	function go(link: string) {
		window.open(link, '_blank', 'noopener,noreferrer');
	}
</script>

<Dialog bind:this={innerDialog}>
	<div class="vstack">
		<div class="top">
			<button aria-label="close" class="exit-button" onclick={() => close()}>
				<span class="fa-solid fa-x"></span>
			</button>
			<p class="title"><strong>Support The Development of Beancode Web</strong></p>
		</div>
		<div class="selector">
			{#each possibleViews as viewName}
				<button
					onclick={() => {
						view = viewName;
					}}
					class={selectorStyle(viewName)}
				>
					{viewName.toUpperCase()}
				</button>
			{/each}
		</div>
		<div class="middle">
			{#if view === 'donate'}
				<div class="donate-wrapper">
					<p class="label">
						<strong>
							If you have found the beancode interpreter, or this IDE (beancode web) useful, please
							consider supporting me, by making a donation.
						</strong>
					</p>
					<p class="label">
						You are funding development to make beancode and beancode web even better than it already is,
                        for everybody. All donations are greatly appreciated.
					</p>
					<p class="label">
						You can disable this pop-up in Settings -&gt; Advanced, found on the top-right of your
						screen (The Gear Icon).
					</p>
					<div class="donate-buttons">
						<button
							class="donate-button liberapay"
							onclick={() => go('https://liberapay.com/ezntek')}
						>
							<img alt="Liberapay Logo" src="/liberapay_logo.svg" class="payment-logo" />
							Support me on Liberapay
						</button>
						<button class="donate-button kofi" onclick={() => go('https://ko-fi.com/ezntek')}>
							<img alt="Ko-fi Logo" src="/kofi_logo.svg" class="payment-logo" />
							Support me on Ko-fi
						</button>
					</div>
				</div>
			{:else if view === 'why donate'}
				<p class="label">
					The development and maintenance of beancode and beancode web is
					<strong>only done by one person</strong>, that being
					<a href="mailto:eason@ezntek.com">ezntek a.k.a. Eason</a> (me).
				</p>
				<p class="label">The more support I receive, the more likely I am to:</p>
				<ol style="margin-top: 0px">
					<li>
						<strong>
							Respond to <a href="https://github.com/ezntek/beancode-web/issues/">bug reports</a>,
							over e-mail or GitHub faster.
						</strong>
					</li>
					<li>
						Add new features, like Java support, SQLite support, multiple projects, drag-and-drop to
						upload, etc.
					</li>
					<li>Add more features to the beancode interpreter itself.</li>
				</ol>
				<p class="label">
					All support that you give is extremely valuable for me. Even a small donation would make
					my day, and help make beancode web better for the rest of us.
				</p>
				<p class="label">
                    If you make a donation, and notify me of it, I may add an extra feature or two, at your
                    request. Simply <a href="mailto:eason@ezntek.com">E-mail me</a>.
				</p>
			{/if}
		</div>
		<div class="bottom">
			<button class="grayed" onclick={() => submitCancel()}> I'll think about it later </button>
		</div>
	</div>
</Dialog>

<style>
	a:link,
	a:visited,
	a:active {
		color: var(--bw-blue);
	}
	a:hover {
		color: var(--bw-blue);
		font-weight: bold;
	}
	.vstack {
		font-family: 'IBM Plex Mono', monospace !important;
		display: flex;
		flex-direction: column;
		width: 40vw;
		max-width: 40vw;
		min-height: 60vh;
	}

	.top {
		display: flex;
		flex-direction: row;
		align-items: left;
		align-content: center;
		min-width: 0;
		background-color: var(--bw-surface1);
		padding: 0.4em 0.5em 0.4em 0.5em;
	}

	.middle {
		display: flex;
		flex-direction: column;
		margin: 0.5em;
		gap: 0.5em;
		margin-bottom: auto;
		align-items: start;
	}

	.bottom {
		display: flex;
		flex-direction: row;
		justify-content: right;
		margin: 0.5em;
		margin-top: 0px;
		gap: 0.5em;
	}

	.donate-wrapper {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		min-height: 100%;
	}

	.donate-buttons {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.donate-button {
		display: flex;
		gap: 10px;
		font-family: 'IBM Plex Mono', monospace !important;
		padding: 0.5em;
		border-width: 0px;
		border-radius: 3px;
		color: var(--bw-text);
		font-weight: bold;
		font-size: 1.5em;
		width: 100%;
		transition:
			background-color var(--bw-animation-delay) ease,
			color var(--bw-animation-delay) ease,
			font-weight var(--bw-animation-delay) ease;
		background-color: var(--bw-surface1);
		color: var(--bw-text);
	}

	.liberapay:hover {
		color: var(--bw-yellow);
	}

	.kofi:hover {
		color: var(--bw-red);
	}

	.donate-button:hover {
		background-color: var(--bw-base3);
	}

	.payment-logo {
		width: 1.5em;
		margin-right: 0.75em;
	}

	.bottom button {
		font-family: 'IBM Plex Mono', monospace !important;
		padding: 0.3em;
		border-width: 0px;
		border-radius: 3px;
		color: var(--bw-text);
		font-weight: bold;
		font-size: 0.8em;
		transition:
			background-color var(--bw-animation-delay) ease,
			color var(--bw-animation-delay) ease,
			font-weight var(--bw-animation-delay) ease;
	}

	.bottom .grayed {
		background-color: var(--bw-overlay2);
		color: var(--bw-base1);
	}

	.bottom .grayed:hover {
		background-color: var(--bw-base1);
		color: var(--bw-overlay2);
	}

	ol,
	li {
		color: var(--bw-text);
		font-size: 1.1em;
	}

	li {
		margin-top: 0px;
	}

	.label {
		font-size: 1.2em;
		color: var(--bw-text);
		margin-right: 0.8em;
		margin-bottom: 1.3em;
		margin-top: 0px;
	}

	.title {
		color: var(--bw-yellow);
		padding: 0px;
		margin: 0px;
		margin-left: 0.8em;
	}

	.selector {
		display: flex;
		min-height: 0px;
	}

	.selector > button {
		padding-top: 0.3em;
		padding-bottom: 0.3em;
		flex: 1;
		font-family: 'IBM Plex Mono', monospace !important;
		font-size: 0.9em;
		border: 0px;
		border-radius: 0px;
		background-color: var(--bw-base1);
		color: var(--bw-text);
		transition:
			background-color var(--bw-animation-delay) ease,
			color var(--bw-animation-delay) ease,
			font-weight var(--bw-animation-delay) ease;
	}

	.selector > button:hover {
		background-color: var(--bw-base3);
		color: var(--bw-text);
	}

	.selector-selected {
		background-color: var(--bw-base2) !important;
		font-weight: bold;
	}
</style>
