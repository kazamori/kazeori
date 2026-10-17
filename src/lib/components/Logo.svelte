<!-- ロゴ。画像がなければ社名を文字で表示し、社名もなければ何も描かない。 -->
<script lang="ts">
	let {
		src,
		name,
		height = 76,
		white = false
	}: { src: string | null; name: string | null; height?: number; white?: boolean } = $props();
</script>

{#if src}
	<img class="logo" {src} alt={name ?? ''} style:height="{height}px" />
{:else if name}
	<span class={['name', { white }]} style:font-size="{Math.round(height * 0.55)}px">{name}</span>
{/if}

<style>
	.logo {
		display: block;
		width: auto;
		max-width: 520px;
		object-fit: contain;
		object-position: left center;
	}

	.name {
		display: block;
		font-family: var(--kz-font-heading);
		font-weight: 700;
		color: var(--kz-accent1);
		line-height: 1;
	}

	.name.white {
		color: var(--kz-white);
	}
</style>
