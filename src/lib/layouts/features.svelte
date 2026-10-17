<!-- 左に導入文、右に番号付きの帯で項目を並べる。pptx の slide3（Featured List）。 -->
<script lang="ts">
	import ListBars from '../components/ListBars.svelte';
	import type { LayoutProps } from '../types';

	let props: LayoutProps = $props();
</script>

<ListBars {...props} />
