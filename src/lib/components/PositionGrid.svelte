<script lang="ts">
	import { game, setPositions } from '../state.svelte';

	const vals = [2, 3, 4, 5, 6];
</script>

<div class="position-grid">
	{#each vals as v (v)}
		<button
			class="position-cell pixel-num"
			class:active={game.positions === v}
			data-val={v}
			type="button"
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
	/* 数字键：深色凸起方块，选中为炽热余烬块 */
	.position-cell {
		background: linear-gradient(180deg, #26170b, #170d06);
		border: 1px solid rgba(201, 149, 68, 0.35);
		color: var(--ash);
		padding: 10px 0;
		border-radius: 3px;
		font-size: 11px;
		box-shadow:
			inset 0 1px 0 rgba(255, 190, 110, 0.14),
			inset 0 -2px 0 rgba(0, 0, 0, 0.55);
		transition: all 160ms ease;
	}
	.position-cell.active {
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
	.position-cell:active {
		transform: translateY(1px);
	}
	@media (min-width: 768px) {
		.position-cell {
			font-size: 12px;
			padding: 12px 0;
		}
	}
</style>
