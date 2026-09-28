<script lang="ts">
	import { SAME_ITEM_PRESETS } from '../data/data';
	import { applySameItemPreset, game } from '../state.svelte';
</script>

<div class="settings-section" class:hidden={game.mode !== 'sameitem'} class:locked={game.running}>
	<div class="section-title">物品排列</div>
	<div class="preset-grid">
		{#each Object.keys(SAME_ITEM_PRESETS) as name (name)}
			<button
				type="button"
				class="preset-cell"
				class:active={game.sameItemPreset === name}
				disabled={game.running}
				onclick={() => applySameItemPreset(name)}>{name}</button
			>
		{/each}
	</div>
</div>

<style>
	.preset-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 6px;
	}
	.preset-cell {
		background: rgba(244, 236, 216, 0.08);
		border: 1px solid rgba(201, 169, 97, 0.3);
		color: var(--cream);
		padding: 10px 0;
		border-radius: 6px;
		font-size: 13px;
		font-weight: 600;
		letter-spacing: 1px;
		transition: all 200ms ease;
	}
	.preset-cell.active {
		background: linear-gradient(135deg, var(--gold), var(--brass));
		color: var(--wood-dark);
		border-color: var(--gold);
		transform: scale(1.05);
	}
	.preset-cell:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}
</style>
