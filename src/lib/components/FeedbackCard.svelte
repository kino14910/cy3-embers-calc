<script lang="ts">
	import { feedbackMaxFor, game, setFeedbackValue } from '../state.svelte';

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
	// 每行悬停预览值：null 表示无预览，展示已提交值
	let hoverNext = $state<Partial<Record<RowKey, number | null>>>({});

	function valueOf(key: RowKey): number {
		if (key === 'highlight') return game.highlight;
		if (key === 'pale') return game.pale;
		return game.matchCount;
	}

	// 点击第 i 个圆点（0 基）：当前值恰为 i+1 时减到 i（如此可一路点回 0），否则设为 i+1
	function nextValue(key: RowKey, i: number): number {
		const val = valueOf(key);
		return val === i + 1 ? i : i + 1;
	}

	function shownValue(key: RowKey): number {
		const h = hoverNext[key];
		return h === null || h === undefined ? valueOf(key) : h;
	}

	function preview(key: RowKey, i: number, enabled: boolean) {
		if (enabled) hoverNext[key] = nextValue(key, i);
	}

	function pick(key: RowKey, i: number) {
		setFeedbackValue(key, nextValue(key, i));
		hoverNext[key] = null;
	}
</script>

<svelte:window onclick={() => (openTip = null)} />

<div class="feedback-card">
	{#each rows as row, ri (row.key)}
		{@const val = valueOf(row.key)}
		{@const shown = shownValue(row.key)}
		{@const max = feedbackMaxFor(row.key)}
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
			<span class="feedback-count">{shown}</span>
			<div
				class="feedback-display"
				role="group"
				aria-label={row.tapAriaLabel}
				onmouseleave={() => (hoverNext[row.key] = null)}
			>
				{#each { length: game.positions } as _, i (i)}
					{@const enabled = i < max}
					<button
						type="button"
						class="feedback-orb {i < shown ? row.orbClass : 'dim'}"
						class:preview={i < shown && i >= val}
						class:unlit={i >= shown && i < val}
						disabled={!enabled}
						aria-label="{row.name} {i + 1}"
						aria-pressed={i < val}
						onmouseenter={() => preview(row.key, i, enabled)}
						onfocus={() => preview(row.key, i, enabled)}
						onblur={() => (hoverNext[row.key] = null)}
						onclick={() => pick(row.key, i)}
					></button>
				{/each}
			</div>
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
		padding: 0;
		flex-shrink: 0;
		cursor: pointer;
		transition:
			opacity 120ms ease,
			transform 120ms ease;
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
	.feedback-orb.dim {
		background: radial-gradient(
			circle at 30% 30%,
			rgba(140, 130, 118, 0.5),
			rgba(110, 102, 92, 0.45) 55%,
			rgba(88, 80, 72, 0.4)
		);
		box-shadow: inset 0 -2px 4px rgba(0, 0, 0, 0.12);
		border-color: rgba(120, 110, 100, 0.35);
	}
	.feedback-orb.preview {
		opacity: 0.6;
		transform: scale(0.9);
	}
	.feedback-orb.unlit {
		opacity: 0.35;
	}
	.feedback-orb:disabled {
		cursor: not-allowed;
		opacity: 0.25;
	}
	.feedback-orb:focus-visible {
		outline: 2px solid var(--ember-orange);
		outline-offset: 2px;
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
</style>
