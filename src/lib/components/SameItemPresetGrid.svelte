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
	/* 排列键：深色凸起方块，选中为炽热余烬块 */
	.preset-cell {
		background: linear-gradient(180deg, #26170b, #170d06);
		border: 1px solid rgba(201, 149, 68, 0.35);
		color: var(--ash);
		padding: 10px 0;
		border-radius: 3px;
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 2px;
		box-shadow:
			inset 0 1px 0 rgba(255, 190, 110, 0.14),
			inset 0 -2px 0 rgba(0, 0, 0, 0.55);
		transition: all 160ms ease;
	}
	.preset-cell.active {
		background: linear-gradient(180deg, #ff8a30, var(--ember) 50%, var(--ember-deep));
		border-color: #31170a;
		color: #fff3d8;
		text-shadow: 0 1px 0 rgba(70, 20, 0, 0.65);
		transform: translateY(-1px);
		box-shadow:
			inset 0 1px 0 rgba(255, 210, 130, 0.5),
			inset 0 -2px 0 rgba(110, 30, 0, 0.55),
			0 0 12px rgba(255, 106, 31, 0.5);
	}
	.preset-cell:active:not(:disabled) {
		transform: translateY(1px);
	}
	.preset-cell:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}
</style>
