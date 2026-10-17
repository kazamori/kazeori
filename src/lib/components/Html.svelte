<!--
  markdown から生成した HTML を本文の書式で表示する。
  markdown は workspace の持ち主が書いたもので、Slidev と同じく HTML の直書きも許すため {@html} で描く。
-->
<script lang="ts">
	let { html, class: className = '' }: { html: string; class?: string } = $props();
</script>

{#if html}
	<div class={['kz-prose', className]}>{@html html}</div>
{/if}
