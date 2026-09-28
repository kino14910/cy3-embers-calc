<script lang="ts">
	import { game, openPicker } from '../state.svelte';

	type RowKey = 'highlight' | 'pale' | 'match';
	interface Row {
		key: RowKey;
		name: string;
		tip: string;
		orbClass: 'highlight' | 'pale';
		tapAriaLabel: string;
	}
	interface Props {
		rows: Row[];
	}
	let { rows }: Props = $props();

	let openTip = $state<RowKey | null>(null);

	function valueOf(key: RowKey): number {
		if (key === 'highlight') return game.highlight;
		if (key === 'pale') return game.pale;
		return game.matchCount;
	}
</script>

<svelte:window onclick={() => (openTip = null)} />

<div class="feedback-card">
	{#each rows as row, ri (row.key)}
		{@const val = valueOf(row.key)}
		<div class="feedback-row" class:first-row={ri === 0}>
			<button
				class="feedback-name"
				class:show-tip={openTip === row.key}
				type="button"
				data-tip={row.tip}
				onclick={(e) => {
					e.stopPropagation();
					openTip = openTip === row.key ? null : row.key;
				}}>{row.name}</button
			>
			<div class="feedback-display">
				<span class="feedback-count">{val}</span>
				{#key val}
					{#each { length: val } as _, i (i)}
						<div class="feedback-orb {row.orbClass}" style:animation-delay="{i * 50}ms"></div>
					{/each}
				{/key}
			</div>
			<button
				class="feedback-tap"
				type="button"
				aria-label={row.tapAriaLabel}
				onclick={(e) => openPicker(row.key, e.currentTarget)}>点 选</button
			>
		</div>
	{/each}
</div>

<style>
	.feedback-card {
		background: linear-gradient(180deg, var(--card-top) 0%, var(--card-bottom) 100%);
		background-color: rgba(244, 236, 216, var(--glass-alpha));
		backdrop-filter: blur(var(--glass-blur)) saturate(140%);
		-webkit-backdrop-filter: blur(var(--glass-blur)) saturate(140%);
		border: 2px solid var(--card-border);
		border-radius: 12px;
		padding: 6px 16px;
		box-shadow: 0 6px 18px var(--shadow);
		flex-shrink: 0;
	}
	.feedback-row {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 0;
	}
	.feedback-row:not(.first-row) {
		border-top: 1px dashed rgba(166, 124, 63, 0.4);
	}
	.feedback-name {
		font-size: 14px;
		color: var(--text-ink);
		font-weight: 700;
		min-width: 56px;
		letter-spacing: 1px;
		cursor: help;
		position: relative;
		user-select: none;
		background: none;
		border: none;
		padding: 0;
		text-align: left;
	}
	.feedback-name::after {
		content: attr(data-tip);
		position: absolute;
		bottom: calc(100% + 6px);
		left: 0;
		transform: scale(0.9);
		transform-origin: left bottom;
		background: var(--wood-dark);
		color: var(--cream);
		padding: 5px 10px;
		border-radius: 5px;
		font-size: 11px;
		font-weight: 400;
		letter-spacing: 0;
		white-space: nowrap;
		opacity: 0;
		pointer-events: none;
		transition:
			opacity 180ms ease,
			transform 180ms ease;
		z-index: 50;
		border: 1px solid var(--gold);
		box-shadow: 0 2px 6px var(--shadow);
	}
	.feedback-name.show-tip::after {
		opacity: 1;
		transform: scale(1);
	}
	.feedback-display {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 6px;
		flex-wrap: wrap;
		min-height: 28px;
	}
	.feedback-orb {
		width: 22px;
		height: 22px;
		border-radius: 50%;
		border: 1.5px solid rgba(42, 24, 16, 0.4);
		animation: orbIn 240ms ease backwards;
	}
	.feedback-orb.highlight {
		background: radial-gradient(circle at 30% 30%, #ffb347, #ff8c00 50%, #d2691e);
		box-shadow:
			0 0 12px 3px rgba(255, 140, 0, 0.55),
			inset 0 -2px 4px rgba(0, 0, 0, 0.25);
		border-color: rgba(139, 58, 31, 0.6);
	}
	.feedback-orb.pale {
		background: radial-gradient(circle at 30% 30%, #ffffff, #e8f3fb 55%, #bfe0f2);
		box-shadow:
			0 0 10px 3px rgba(93, 173, 226, 0.5),
			inset 0 -2px 4px rgba(0, 0, 0, 0.12);
		border-color: rgba(93, 140, 173, 0.5);
	}
	@keyframes orbIn {
		from {
			opacity: 0;
			transform: scale(0);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
	.feedback-count {
		font-size: 18px;
		font-weight: 700;
		color: var(--ember-red);
		min-width: 18px;
		text-align: center;
	}
	.feedback-tap {
		background: rgba(166, 124, 63, 0.15);
		border: 1px dashed var(--brass);
		color: var(--text-mute);
		padding: 8px 14px;
		border-radius: 6px;
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 1px;
		transition: all 200ms ease;
		white-space: nowrap;
	}
	.feedback-tap:active {
		background: var(--brass);
		color: var(--cream);
		transform: scale(0.96);
	}
</style>
