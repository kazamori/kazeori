<script lang="ts">
	import '@fontsource/metropolis/400.css';
	import '@fontsource/metropolis/700.css';
	import '@fontsource/metropolis/800.css';
	import '@fontsource/roboto/400.css';
	import '@fontsource/roboto/400-italic.css';
	import '@fontsource/roboto/700.css';
	import '@fontsource/noto-sans-jp/400.css';
	import '@fontsource/noto-sans-jp/700.css';
	import '#lib/themes/base.css';

	let { children } = $props();
</script>

{@render children()}

<style>
	:global(html, body) {
		margin: 0;
		padding: 0;
	}
</style>
