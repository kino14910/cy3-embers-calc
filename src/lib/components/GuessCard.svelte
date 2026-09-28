<script lang="ts">
	import { elementLabelFor, game, orbGradient } from '../state.svelte';
</script>

{#if game.currentGuess && !game.finished}
	<div class="guess-card">
		<div class="guess-label">本 回 合 推 测</div>
		<div class="guess-slots">
			{#key game.currentGuess}
				{#each game.currentGuess as idx, i (i)}
					<div class="guess-slot" style:animation-delay="{i * 60}ms">
						<div class="slot-orb" style:background={orbGradient(idx)}></div>
						<div class="slot-name">{elementLabelFor(idx)}</div>
					</div>
				{/each}
			{/key}
		</div>
	</div>
{/if}

<style>
	.guess-card {
		background: linear-gradient(180deg, var(--card-top) 0%, var(--card-bottom) 100%);
		background-color: rgba(244, 236, 216, var(--glass-alpha));
		backdrop-filter: blur(var(--glass-blur)) saturate(140%);
		-webkit-backdrop-filter: blur(var(--glass-blur)) saturate(140%);
		border: 2px solid var(--card-border);
		border-radius: 12px;
		padding: 22px 16px 18px;
		box-shadow: 0 6px 18px var(--shadow);
		position: relative;
	}
	.guess-card::before {
		content: '';
		position: absolute;
		top: 6px;
		left: 6px;
		right: 6px;
		bottom: 6px;
		border: 1px solid rgba(166, 124, 63, 0.3);
		border-radius: 8px;
		pointer-events: none;
	}
	.guess-label {
		font-size: 11px;
		color: var(--ember-red);
		letter-spacing: 4px;
		text-align: center;
		margin-bottom: 16px;
		font-weight: 600;
	}
	.guess-slots {
		display: flex;
		justify-content: center;
		column-gap: 10px;
		row-gap: 26px;
		flex-wrap: wrap;
	}
	.guess-slot {
		width: 48px;
		height: 48px;
		margin-bottom: 12px;
		border-radius: 50%;
		border: 2px solid var(--brass);
		background: var(--parchment-dark);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow:
			inset 0 -4px 8px rgba(0, 0, 0, 0.2),
			0 2px 4px var(--shadow);
		animation: slotIn 400ms cubic-bezier(0.22, 1, 0.36, 1) backwards;
		position: relative;
	}
	@keyframes slotIn {
		from {
			opacity: 0;
			transform: translateY(-12px) scale(0.7);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}
	.slot-orb {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: 2px solid rgba(42, 24, 16, 0.4);
		box-shadow:
			inset 0 -3px 6px rgba(0, 0, 0, 0.4),
			inset 0 3px 6px rgba(255, 255, 255, 0.25);
	}
	.slot-name {
		position: absolute;
		bottom: -18px;
		font-size: 10px;
		color: var(--text-mute);
		font-weight: 600;
		white-space: nowrap;
	}
	@media (min-width: 768px) {
		.guess-slot {
			width: 64px;
			height: 64px;
		}
		.slot-orb {
			width: 44px;
			height: 44px;
		}
	}
</style>
