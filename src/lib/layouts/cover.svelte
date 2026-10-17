<!-- 表紙（全面 accent1）。pptx の slide1、slide2。 -->
<script module lang="ts">
	import type { LayoutChrome } from '../types';

	export const chrome: LayoutChrome = 'none';
</script>

<script lang="ts">
	import CoverBase from '../components/CoverBase.svelte';
	import type { LayoutProps } from '../types';

	let props: LayoutProps = $props();
</script>

<CoverBase {...props} />
