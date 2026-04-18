<script lang="ts">
	import { onMount } from 'svelte';

	// TODO: actually implement dark mode
	let mode = $state('Light');

	function toggleMode() {
		if (mode == 'Light') {
			mode = 'Dark';
		} else {
			mode = 'Light';
		}
		document.documentElement.setAttribute('data-theme', mode);
	}

	onMount(() => {
		const mq = window.matchMedia('(prefers-color-scheme: dark)');

		const changeTheme = () => {
			mode = mq.matches ? 'Dark' : 'Light';
			document.documentElement.setAttribute('data-theme', mode);
		};

		// do it once fisrt
		changeTheme();
		mq.addEventListener('change', changeTheme);

		return () => mq.removeEventListener('change', changeTheme);
	});
</script>

<div id="homepage">
	<div id="island-wrap">
		<div id="island">
			<div style="display: flex; align-items: center; flex-direction: column;">
				{#if mode === 'Light'}
					<img src="/logo.png" id="bcimg" alt="beancode logo" />
				{:else}
					<img src="/logo_dark.png" id="bcimg" alt="beancode logo" />
				{/if}
				<p style="color: var(--subtext); font-size: 1.3em; margin: 0.8em; text-align: center;">
					<em>
						Beancode Web is a
						<strong>100% Free and Open Source, fully browser-local</strong>
						Online IDE for <br /> IGCSE/O-Level Pseudocode and Python!
					</em>
				</p>
				<span style="margin: 0.8em; display: block;">
					<a href="/editor" class="link" title="Opens the editor.">
						<span class="fa-solid fa-pencil"></span> Go to editor
					</a>
					<a
						class="link"
						href="https://github.com/ezntek/beancode-web"
						title="Opens https://github.com/ezntek/beancode-web. Give us a star!"
					>
						<span class="fa-brands fa-github"></span> Go to project GitHub
					</a>
					<button class="link" onclick={() => toggleMode()}>
						{#if mode === 'Light'}
							<span class="fa-solid fa-sun"></span>
						{:else}
							<span class="fa-solid fa-moon"></span>
						{/if}
						{mode}
					</button>
				</span>
			</div>

			<br />
			This is essentially the flagship IDE/a front-end for the
			<a href="https://github.com/ezntek/beancode">beancode</a>
			project, a
			<strong>
				100% syllabus-compliant Pseudocode implementation written in standard Python 3.10+, with
				utilities and extension features!
			</strong>.

			<h2>About</h2>
			<p>This is a web IDE for Pseudocode and Python. Here are some major features:</p>
			<ul>
				<li>
					It supports the <strong>0478, 2211, and 0984</strong> IGCSE/O-level syllabi,
					<em>NOT A-LEVEL!</em>
				</li>
				<li>It supports <strong>lowercase keywords</strong> to make typing easier :D</li>
				<li>
					It contains a built-in <strong>formatter</strong>, which prettifies your Pseudocode, just
					like in the textbook. Simply press the format button, and you're off.
					<strong> It will convert lowercase keywords to uppercase! </strong>
				</li>
				<li>It contains a <strong>tracer</strong>, which generates trace tables!</li>
				<li>
					Since beancode (the interpreter itself) is written in Python, we bundle a Python
					interpreter as well, meaning that <strong>you can code in Python too!</strong> Note that
					formatting and tracing <em>do not work</em> when editing Python.
				</li>
			</ul>

			<p>
				This tool is designed to be <em>as straightforward as possible</em> for teachers and
				students, and to hit as many use-cases as possible. If there are concerns, suggestions or
				feature requests, please
				<a href="mailto:eason@ezntek.com?subject=Beancode%2fBeancode%20web%20concerns">
					send me an email
				</a>
				or
				<a href="https://github.com/ezntek/beancode-web/issues/new">send a bug report on GitHub!</a>
				Spam is not appreciated.
			</p>

			<h2>Editor Features</h2>
			<ul>
				<li>
					Both <strong>light and dark modes are available</strong>, for now based on
					<a href="https://catppuccin.com">Catppuccin Latte and Macchiato</a>
					respectively.
				</li>
				<li>There is syntax highlighting and basic autocomplete thanks to CodeMirror.</li>
				<li>
					There is a built-in UNIX-style terminal thanks to Xterm.js, with full escape sequence
					support!
				</li>
				<li>
					There is also a file browser, emulating a UNIX-style file system. Downloading and
					uploading files works just fine!
				</li>
			</ul>

			<h2>How it works</h2>
			<p>
				Beancode web does not rely on typical techniques of
				<a
					href="https://dev.to/nilmadhabmondal/let-s-develop-an-online-code-editor-compiler-like-hackerrank-3k0l"
				>
					sending code to a remote server and running it.
				</a>
				Instead, all code execution is done with
				<a
					title="Realistically, nobody call is that. It just makes WASM sound snazzier."
					href="https://webassembly.org/"
					style="cursor: help;"
				>
					WebAssembly technology™
				</a>, meaning that the Python interpreter runs directly in the web browser, and no data is
				sent to remote servers. This is also the case for beancode, which uses Python. The only
				network activity is on launch, where the Python interpreter is loaded from the
				<a href="https://pyodide.org">Pyodide Website</a>.
			</p>

			<p>
				The Pseudocode interpreter itself runs within Python (as mentioned before). When you type
				code into the code editor and run it, it sends the code you wrote to a background
				<a
					href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers"
				>
					web worker
				</a>(completely local, again), which runs your code.
			</p>

			<p>
				Your code is also stored locally in IndexedDB with IDBFS, which are fancy terms for; it is
				all stored in your browser.
				<strong>
					Note that beancode web will ask you for persistent storage, as that is integral to storing
					your code safely.
				</strong>
				If you do not grant access, your settings and code may mysteriously vanish.
			</p>

			<h2>Credits</h2>
			Despite my tireless work on the web IDE (sacrificing my entire winter break), I still used libraries
			that I did not make, and I'd like to thank these people for writing awesome software that this project
			could not have existed without:
			<ul>
				<li>
					<a href="https://codemirror.net">CodeMirror</a> for the code editor component (text selection,
					copy paste, indentation)
				</li>
				<li>
					<a href="https://lezer.codemirror.net">The Lezer Parser System</a> as the syntax highlighting
					backend
				</li>
				<li><a href="https://xtermjs.org">Xterm.js</a> for the terminal</li>
				<li>
					<a href="https://pyodide.org">Pyodide</a> in order to run CPython in WebAssembly, and the
					<a href="https://github.com/ezntek/beancode">beancode</a>
					interpreter
				</li>
			</ul>
		</div>
		<div style="display: flex;">
			<p class="lbl">This website is copyright © Eason Qin (ezntek), 2026 (eason@ezntek.com)</p>
		</div>
	</div>
</div>

<style>
	:global(:root),
	:global([data-theme='Light']) {
		--bg-base: #f0f9e8;
		--base: #dcf1c8;
		--subsubtext: #618446;
		--subtext: #526e35;
		--border: gray;
		--text: #30401f;
		--shadow: gray;
		--bg-img: url('/smalllogo.png');
	}
	:global([data-theme='Dark']) {
		/* TODO: actually implment dark mode */
		--bg-base: #2a2b2b;
		--base: #353a38;
		--subsubtext: #dcf1c8;
		--subtext: #618446;
		--text: #f0f9e8;
		--border: #575a5a;
		--shadow: var(--border);
		--bg-img: url('/smalllogo_dark.png');
	}

	a:link {
		color: var(--subsubtext);
	}

	a:visited {
		color: var(--subtext);
	}

	a:hover {
		color: var(--text);
	}

	a:active {
		color: var(--text);
	}

	.lbl {
		font-family:
			IBM Plex Mono,
			monospace;
		margin: 0.5em;
		text-align: right;
		color: var(--subtext);
		text-shadow: 5px 5px 5px var(--shadow);
	}

	#homepage {
		position: absolute;
		top: 0px;
		left: 0px;
		font-family:
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			Roboto,
			Oxygen,
			Ubuntu,
			Cantarell,
			'Open Sans',
			'Helvetica Neue',
			sans-serif;
		background-color: var(--bg-base);
		overflow: hidden;
	}

	#homepage::before {
		content: '';
		position: absolute;
		inset: -50%;
		background-image: var(--bg-img);
		background-repeat: repeat;
		background-size: 40px 40px; /* adjust spacing */
		background-position: center;
		transform: rotate(45deg); /* diagonal */
		z-index: 0;
	}

	#homepage > * {
		position: relative;
		z-index: 1;
	}
	#bcimg {
		max-width: 70%;
	}
	#island-wrap {
		margin-top: 2em;
		margin-bottom: 2em;
		margin-left: 15vw;
		margin-right: 15vw;
	}

	#island {
		color: var(--text);
		background-color: var(--base);
		font-size: 1.2em;
		padding: 0.8em;
		border: 2px solid var(--border);
		border-radius: 8px;
		box-shadow: 5px 5px 5px var(--shadow);
	}

	.link {
		font-family: 'IBM Plex Mono', monospace !important;
		padding: 0.3em;
		border-width: 0px;
		border-radius: 3px;
		background-color: var(--bg-base);
		color: var(--text);
		font-weight: bold;
		font-size: 1.2em;
		transition:
			background-color 130ms ease,
			color 130ms ease,
			font-weight 130ms ease;
	}
	.link:link,
	.link:visited,
	.link:hover,
	.link:active {
		color: var(--text);
		text-decoration: none;
	}
	.link:hover {
		color: var(--bg-base);
		background-color: var(--text);
	}

	@media (max-width: 1400px), (max-height: 800px) {
		#island-wrap {
			margin-top: 1.5em;
			margin-bottom: 1.5em;
			margin-left: 10vw;
			margin-right: 10vw;
		}

		#island {
			font-size: 1em;
			padding: 0.6em;
		}

		.link {
			font-size: 1em;
		}
	}
</style>
