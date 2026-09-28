<script lang="ts">
	import { closePicker, game, pickerMaxFor, pickValue, registerPickerSheet, ui } from '../state.svelte';

	let target = $derived(ui.pickerTarget);
	let label = $derived(
		target === 'highlight' ? '亮点' : target === 'pale' ? '苍白点' : '匹配数'
	);
	let maxAllowed = $derived(target ? pickerMaxFor(target) : 0);
	let upper = $derived(Math.max(game.positions, 6));
	let values = $derived(Array.from({ length: upper + 1 }, (_, v) => v));

	function attachSheet(node: HTMLDivElement) {
		registerPickerSheet(node);
		return () => registerPickerSheet(null);
	}
</script>

<div
	class="picker-mask"
	class:show={target !== null}
	onclick={closePicker}
	role="presentation"
></div>
<div
	class="picker-sheet"
	class:show={target !== null}
	role="dialog"
	aria-modal="true"
	aria-labelledby="pickerLabel"
	tabindex="-1"
	{@attach attachSheet}
	onkeydown={(e) => {
		if (e.key === 'Escape') closePicker();
	}}
>
	<div class="picker-handle"></div>
	<div class="picker-title">选择 <span id="pickerLabel">{label}</span> 数量</div>
	<div class="picker-grid">
		{#key target}
			{#each values as v (v)}
				<button
					type="button"
					class="picker-cell"
					data-val={v}
					disabled={v > maxAllowed}
					onclick={() => pickValue(v)}>{v}</button
				>
			{/each}
		{/key}
	</div>
</div>

<style>
	.picker-mask {
		position: fixed;
		inset: 0;
		background: rgba(26, 15, 8, 0);
		pointer-events: none;
		transition:
			background 250ms ease,
			opacity 250ms ease;
		z-index: 90;
	}
	.picker-mask.show {
		background: rgba(26, 15, 8, 0.55);
		pointer-events: auto;
	}
	.picker-sheet {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		background-image:
			linear-gradient(180deg, rgba(60, 36, 24, 0.97), rgba(42, 24, 16, 0.97)),
			url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><filter id='w'><feTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='2'/><feColorMatrix values='0 0 0 0 0.6 0 0 0 0 0.45 0 0 0 0 0.25 0 0 0 0.15 0'/></filter><rect width='100%' height='100%' filter='url(%23w)'/></svg>");
		border-top: 2px solid var(--gold);
		border-radius: 18px 18px 0 0;
		transform: translateY(100%);
		transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1);
		z-index: 100;
		padding: 14px 16px 28px;
		padding-bottom: calc(28px + env(safe-area-inset-bottom));
		box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.4);
	}
	.picker-sheet.show {
		transform: translateY(0);
	}
	.picker-handle {
		width: 40px;
		height: 4px;
		background: rgba(201, 169, 97, 0.5);
		border-radius: 2px;
		margin: 0 auto 14px;
	}
	.picker-title {
		color: var(--gold);
		font-size: 15px;
		text-align: center;
		margin-bottom: 16px;
		letter-spacing: 2px;
	}
	.picker-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		justify-content: center;
		max-width: 480px;
		margin: 0 auto;
	}
	.picker-cell {
		flex: 1 1 calc(25% - 10px);
		min-width: 64px;
		max-width: 100px;
		background: linear-gradient(135deg, var(--cream), var(--parchment-dark));
		border: 2px solid var(--brass);
		color: var(--wood-dark);
		padding: 18px 0;
		border-radius: 10px;
		font-size: 22px;
		font-weight: 700;
		transition: all 160ms ease;
		box-shadow: 0 3px 6px var(--shadow);
	}
	.picker-cell:active {
		transform: scale(0.94);
		background: linear-gradient(135deg, var(--gold), var(--brass));
		color: var(--cream);
	}
	.picker-cell:disabled {
		opacity: 0.3;
		cursor: not-allowed;
		background: rgba(244, 236, 216, 0.4);
		border-color: rgba(166, 124, 63, 0.3);
		box-shadow: none;
	}
	@media (min-width: 768px) {
		.picker-cell {
			padding: 22px 0;
			font-size: 26px;
		}
	}
</style>
