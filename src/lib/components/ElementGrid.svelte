<script lang="ts">
	import { ELEMENTS } from '../data/data';
	import { elementLabelFor, game, orbGradient, toggleElement } from '../state.svelte';
</script>

<div class="elements-grid">
	{#each ELEMENTS as e, idx (idx)}
		{@const label = elementLabelFor(idx)}
		<button
			type="button"
			class="element-tile"
			class:selected={game.enabledColors.includes(idx)}
			aria-pressed={game.enabledColors.includes(idx)}
			disabled={game.running}
			onclick={() => toggleElement(idx)}
		>
			<div class="element-icon" style:background={orbGradient(idx)}></div>
			<div class="element-name">{label}</div>
			{#if game.elementLabels && game.elementLabels[idx] && game.elementLabels[idx] !== e.name}
				<div class="element-name-sub">{e.name}</div>
			{/if}
		</button>
	{/each}
</div>

<style>
	.elements-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
	}
	.element-tile {
		background: rgba(244, 236, 216, 0.08);
		border: 1px solid rgba(201, 169, 97, 0.3);
		border-radius: 6px;
		padding: 10px 6px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		transition: all 200ms ease;
		color: var(--cream);
	}
	.element-tile:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.element-tile.selected {
		background: linear-gradient(135deg, rgba(201, 169, 97, 0.35), rgba(210, 105, 30, 0.2));
		border-color: var(--gold);
		box-shadow: 0 0 12px rgba(201, 169, 97, 0.4);
		transform: translateY(-2px);
	}
	.element-icon {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		border: 2px solid rgba(244, 236, 216, 0.4);
		box-shadow:
			inset 0 -3px 6px rgba(0, 0, 0, 0.4),
			inset 0 3px 6px rgba(255, 255, 255, 0.2);
	}
	.element-name {
		font-size: 12px;
		color: var(--cream);
		font-weight: 500;
	}
	.element-name-sub {
		font-size: 9px;
		color: rgba(244, 236, 216, 0.45);
		margin-top: -4px;
	}
</style>
