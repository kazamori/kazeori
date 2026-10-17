<!-- アジェンダ。番号付きの箇条書きを帯で並べる。フロントマターの current で現在の章を強調する。 -->
<script lang="ts">
	import ListBars from '../components/ListBars.svelte';
	import type { LayoutProps } from '../types';

	let props: LayoutProps = $props();
</script>

<ListBars {...props} />
