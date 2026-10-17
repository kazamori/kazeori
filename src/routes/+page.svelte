<!-- デッキの一覧。年（デッキ ID の先頭の階層）ごとにまとめる。 -->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { decks } from 'virtual:kazeori/decks';
	import { formatDate } from '#lib/format.ts';

	let groups = $derived.by(() => {
		const byYear: Record<string, typeof decks> = {};
		for (const deck of [...decks].sort((a, b) => b.id.localeCompare(a.id))) {
			const key = deck.id.includes('/') ? deck.id.split('/')[0] : 'その他';
			(byYear[key] ??= []).push(deck);
		}
		return Object.entries(byYear).sort(([a], [b]) => b.localeCompare(a));
	});
</script>

<svelte:head>
	<title>kazeori</title>
</svelte:head>

<main class="kz-theme" data-color="blue">
	<h1>デッキ</h1>
	{#if decks.length === 0}
		<p>デッキがありません。<code>kazeori new &lt;name&gt;</code> で作成してください。</p>
	{/if}
	{#each groups as [year, list] (year)}
		<section>
			<h2>{year}</h2>
			<ul>
				{#each list as deck (deck.id)}
					<li data-color={deck.color} class="kz-theme">
						<a href={resolve('/[...deck]', { deck: deck.id })}>
							<span class="title">{deck.title}</span>
							<span class="meta">
								{[formatDate(deck.date), deck.event, `${deck.slideCount} 枚`]
									.filter(Boolean)
									.join(' ・ ')}
							</span>
						</a>
						<a class="print" href={resolve('/print/[...deck]', { deck: deck.id })}>印刷用</a>
					</li>
				{/each}
			</ul>
		</section>
	{/each}
</main>

<style>
	main {
		max-width: 960px;
		margin: 0 auto;
		padding: 48px 24px;
	}

	h1 {
		font-family: var(--kz-font-heading);
		color: var(--kz-accent1);
	}

	h2 {
		font-family: var(--kz-font-heading);
		font-size: 20px;
		color: var(--kz-text-muted);
		border-bottom: 2px solid var(--kz-lt2);
		padding-bottom: 4px;
	}

	ul {
		list-style: none;
		padding: 0;
	}

	li {
		display: flex;
		align-items: center;
		gap: 16px;
		border-left: 8px solid var(--kz-accent1);
		background: var(--kz-surface);
		margin-bottom: 12px;
		padding: 12px 16px;
	}

	li a:first-child {
		flex: 1;
		display: flex;
		flex-direction: column;
		text-decoration: none;
		color: inherit;
	}

	.title {
		font-weight: 700;
		font-size: 18px;
	}

	.meta {
		font-size: 14px;
		color: var(--kz-text-muted);
	}

	.print {
		font-size: 14px;
		color: var(--kz-accent1);
	}
</style>
