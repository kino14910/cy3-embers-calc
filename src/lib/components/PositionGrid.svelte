<script lang="ts">
	import { game, setPositions } from '../state.svelte';

	const vals = [2, 3, 4, 5, 6];
</script>

<div class="position-grid">
	{#each vals as v (v)}
		<button
			class="position-cell"
			class:active={game.positions === v}
			data-val={v}
			type="button"
			disabled={game.running}
			onclick={() => setPositions(v)}>{v}</button
		>
	{/each}
</div>

<style>
	.position-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 6px;
	}
	.position-cell {
		background: rgba(244, 236, 216, 0.08);
		border: 1px solid rgba(201, 169, 97, 0.3);
		color: var(--cream);
		padding: 10px 0;
		border-radius: 6px;
		font-size: 15px;
		font-weight: 600;
		transition: all 200ms ease;
	}
	.position-cell.active {
		background: linear-gradient(135deg, var(--gold), var(--brass));
		color: var(--wood-dark);
		border-color: var(--gold);
		transform: scale(1.05);
	}
	.position-cell:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}
	@media (min-width: 768px) {
		.position-cell {
			font-size: 17px;
			padding: 12px 0;
		}
	}
</style>
