<!--
  カザモリスタイルのタイトル。1 行目を文字色、titleAccent を accent1 で描く。
  inline のときは 2 つを 1 行に並べ、そうでなければ 2 行に分ける。
  文字が長くて行数が増えるときは、maxLines に収まるまで文字を小さくする（minSize まで）。
  タイトルの改行（\n。markdown の <br> や YAML の改行から作る）は、そのまま改行として描き、その行数に収める。
-->
<script lang="ts">
	let {
		title,
		accent = null,
		size = 72,
		inline = false,
		align = 'left',
		light = false,
		maxLines = null,
		minSize = 44
	}: {
		title: string | null;
		accent?: string | null;
		size?: number;
		inline?: boolean;
		align?: 'left' | 'center';
		light?: boolean;
		maxLines?: number | null;
		minSize?: number;
	} = $props();

	let titleLines = $derived(title ? title.split('\n').length : 0);
	let accentLines = $derived(accent ? accent.split('\n').length : 0);
	// 書き手が改行を明示したときは、その行数に収まるまで文字を小さくし、自動では折り返さない。
	// 明示しないときの上限は、inline なら 1 行、それ以外は 2 行（2 行構成なら各行 1 行ずつ）
	let explicit = $derived(titleLines > 1 || accentLines > 1);
	let lines = $derived(
		maxLines ??
			(explicit ? titleLines + accentLines - (inline && title && accent ? 1 : 0) : inline ? 1 : 2)
	);

	function fit(node: HTMLElement) {
		// title、accent、size が変わったら測り直す
		void [title, accent, size, lines];
		const measure = () => {
			let current = size;
			node.style.fontSize = `${current}px`;
			const lineHeight = () => parseFloat(getComputedStyle(node).lineHeight);
			while (current > minSize && node.scrollHeight > lineHeight() * lines + 1) {
				current -= 4;
				node.style.fontSize = `${current}px`;
			}
		};
		measure();
		document.fonts?.ready.then(measure);
	}
</script>

{#if title || accent}
	<h1
		class={['title', { light, inline }]}
		style:font-size="{size}px"
		style:text-align={align}
		{@attach fit}
	>
		{#if title}<span class="main">{title}</span>{/if}
		{#if accent}<span class="accent">{accent}</span>{/if}
	</h1>
{/if}

<style>
	.title {
		margin: 0;
		font-family: var(--kz-font-heading);
		font-weight: 700;
		line-height: 1.15;
		color: var(--kz-text);
	}

	.main,
	.accent {
		display: block;
		white-space: pre-line;
	}

	/* inline のときは 1 行に並べ、間を半角空白ほど空ける */
	.inline .main,
	.inline .accent {
		display: inline;
	}

	.inline .main + .accent {
		margin-left: 0.25em;
	}

	.accent {
		color: var(--kz-accent1);
	}

	.light {
		color: var(--kz-white);
	}

	.light .accent {
		color: var(--kz-accent4);
	}
</style>
