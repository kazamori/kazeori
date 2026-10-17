<!-- 白背景の表紙。Slidev の intro もこのレイアウトで描く。 -->
<script module lang="ts">
	import type { LayoutChrome } from '../types';

	export const chrome: LayoutChrome = 'none';
</script>

<script lang="ts">
	import CoverBase from '../components/CoverBase.svelte';
	import type { LayoutProps } from '../types';

	let props: LayoutProps = $props();
</script>

<CoverBase {...props} light />
