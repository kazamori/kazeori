<!-- ラベルと割合の横棒（テンプレートの quote、profile の進捗バー）。 -->
<script lang="ts">
	let {
		label,
		value,
		color = 'var(--kz-accent1)'
	}: { label: string; value: number; color?: string } = $props();
</script>

<div class="bar">
	<div class="labels">
		<span class="label">{label}</span>
		<span class="value" style:color>{value}%</span>
	</div>
	<div class="track">
		<div
			class="fill"
			style:width="{Math.min(100, Math.max(0, value))}%"
			style:background={color}
		></div>
	</div>
</div>

<style>
	.bar {
		width: 100%;
	}

	.labels {
		display: flex;
		justify-content: space-between;
		font-size: 22px;
		font-weight: 700;
		color: var(--kz-text);
		margin-bottom: 10px;
	}

	.value {
		font-family: var(--kz-font-heading);
	}

	.track {
		height: 10px;
		background: var(--kz-lt2);
	}

	.fill {
		height: 100%;
	}
</style>
