<script lang="ts">
	import { CLASSIC_PRESETS, PRIORITY_PRESETS } from '../data/data';
	import { applyClassicPreset, clearClassicPreset, game } from '../state.svelte';

	const allNames = Object.keys(CLASSIC_PRESETS);
	const orderedAll = [...PRIORITY_PRESETS, ...allNames.filter((n) => !PRIORITY_PRESETS.includes(n))];

	let activePreset = $derived(game.classicPreset ? CLASSIC_PRESETS[game.classicPreset] : null);
</script>

<div class="settings-section" class:hidden={game.mode === 'sameitem'} class:locked={game.running}>
	<div class="section-title">
		<span>常用配方</span>
		<button class="tiny-link-btn" type="button" disabled={game.running} onclick={clearClassicPreset}
			>清除配方 ✕</button
		>
	</div>
	<div class="preset-list">
		{#each PRIORITY_PRESETS as name (name)}
			<button
				type="button"
				class="preset-name-cell"
				class:active={game.classicPreset === name}
				disabled={game.running}
				onclick={() => applyClassicPreset(name)}>{name}</button
			>
		{/each}
	</div>
	<div class="section-title" style="margin-top:12px;"><span>全部配方（21）</span></div>
	<div class="preset-list">
		{#each orderedAll as name (name)}
			<button
				type="button"
				class="preset-name-cell"
				class:active={game.classicPreset === name}
				disabled={game.running}
				onclick={() => applyClassicPreset(name)}>{name}</button
			>
		{/each}
	</div>
	<div class="preset-active-tag" class:hidden={!game.classicPreset}>
		{#if game.classicPreset && activePreset}
			当前配方：{game.classicPreset}（{activePreset.numItems} 物品 · {activePreset.allSame ? '全同模式' : '标准模式'}）
		{/if}
	</div>
</div>

<style>
	.preset-list {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.preset-name-cell {
		background: rgba(244, 236, 216, 0.08);
		border: 1px solid rgba(201, 169, 97, 0.3);
		color: var(--cream);
		padding: 7px 10px;
		border-radius: 6px;
		font-size: 11.5px;
		font-weight: 600;
		letter-spacing: 0.5px;
		transition: all 200ms ease;
	}
	.preset-name-cell.active {
		background: linear-gradient(135deg, var(--gold), var(--brass));
		color: var(--wood-dark);
		border-color: var(--gold);
	}
	.preset-name-cell:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}
	.preset-active-tag {
		margin-top: 8px;
		font-size: 10.5px;
		color: var(--gold);
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}
</style>
