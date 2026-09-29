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
	/* 元素槽：凹槽嵌宝石方块，选中即点亮 */
	.element-tile {
		background: linear-gradient(180deg, #1d1208, #120b05);
		border: 1px solid rgba(201, 149, 68, 0.3);
		border-radius: 3px;
		padding: 10px 6px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		box-shadow:
			inset 0 1px 0 rgba(255, 190, 110, 0.1),
			inset 0 -2px 0 rgba(0, 0, 0, 0.5);
		transition: all 180ms ease;
		color: var(--cream);
	}
	.element-tile.selected {
		background: linear-gradient(180deg, rgba(255, 138, 48, 0.22), rgba(198, 62, 16, 0.16));
		border-color: var(--dawnstone);
		box-shadow:
			0 0 14px rgba(255, 106, 31, 0.4),
			inset 0 0 10px rgba(255, 140, 40, 0.22),
			inset 0 1px 0 rgba(255, 210, 130, 0.3);
		transform: translateY(-2px);
	}
	.element-icon {
		width: 28px;
		height: 28px;
		border-radius: 3px;
		border: 1px solid rgba(0, 0, 0, 0.65);
		box-shadow:
			inset 0 2px 0 rgba(255, 255, 255, 0.25),
			inset 0 -3px 0 rgba(0, 0, 0, 0.4),
			0 2px 4px rgba(0, 0, 0, 0.5);
	}
	.element-tile.selected .element-icon {
		box-shadow:
			inset 0 2px 0 rgba(255, 255, 255, 0.3),
			inset 0 -3px 0 rgba(0, 0, 0, 0.4),
			0 0 10px rgba(255, 140, 40, 0.55);
		animation: gemFlicker 1.8s steps(3) infinite;
	}
	@keyframes gemFlicker {
		0%,
		100% {
			filter: brightness(1);
		}
		50% {
			filter: brightness(1.22);
		}
	}
	.element-name {
		font-size: 12px;
		color: var(--bone);
		font-weight: 500;
		letter-spacing: 1px;
	}
	.element-name-sub {
		font-size: 9px;
		color: var(--ash-dim);
		margin-top: -4px;
	}
</style>
