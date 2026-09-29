<script lang="ts">
	import { activeElementLabelFor, game, orbGradient } from '../state.svelte';
</script>

{#if game.currentGuess && !game.finished}
	<div class="guess-card">
		<div class="guess-label">本 回 合 推 测</div>
		<div class="guess-slots">
			{#key game.currentGuess}
				{#each game.currentGuess as idx, i (i)}
					<div class="guess-slot" style:animation-delay="{i * 60}ms">
						<div class="slot-orb" style:background={orbGradient(idx)}></div>
					<div class="slot-name">{activeElementLabelFor(idx)}</div>
					</div>
				{/each}
			{/key}
		</div>
	</div>
{/if}

<style>
	/* 本回合推测：余烬熔接盘 */
	.guess-card {
		background: linear-gradient(180deg, var(--card-top) 0%, var(--card-bottom) 100%);
		border: 2px solid var(--card-border);
		border-radius: 4px;
		padding: 20px 16px 18px;
		box-shadow:
			inset 0 1px 0 var(--card-hi),
			0 4px 14px var(--shadow);
		position: relative;
	}
	.guess-card::before {
		content: '';
		position: absolute;
		top: 5px;
		left: 5px;
		right: 5px;
		bottom: 5px;
		border: 1px solid rgba(201, 149, 68, 0.22);
		border-radius: 2px;
		pointer-events: none;
	}
	.guess-label {
		font-family: 'ZCOOL QingKe HuangYou', 'PingFang SC', 'Microsoft YaHei', sans-serif;
		font-size: 12px;
		color: var(--num-hot);
		letter-spacing: 5px;
		text-align: center;
		margin-bottom: 16px;
		text-shadow: 0 0 8px rgba(255, 140, 40, 0.4);
	}
	.guess-slots {
		display: flex;
		justify-content: center;
		column-gap: 10px;
		row-gap: 26px;
		flex-wrap: wrap;
	}
	/* 方形熔接槽：内凹插座 */
	.guess-slot {
		width: 50px;
		height: 50px;
		margin-bottom: 12px;
		border-radius: 3px;
		border: 1px solid #000;
		background: var(--socket);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow:
			inset 0 2px 6px rgba(0, 0, 0, 0.85),
			inset 0 -1px 0 rgba(255, 150, 60, 0.12),
			0 1px 0 rgba(255, 170, 80, 0.07);
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
	/* 元素宝石：方块晶体贴片 */
	.slot-orb {
		width: 36px;
		height: 36px;
		border-radius: 3px;
		border: 1px solid rgba(0, 0, 0, 0.65);
		box-shadow:
			inset 0 2px 0 rgba(255, 255, 255, 0.28),
			inset 0 -3px 0 rgba(0, 0, 0, 0.4),
			0 0 10px rgba(255, 140, 40, 0.3);
	}
	.slot-name {
		position: absolute;
		bottom: -19px;
		font-size: 10px;
		color: var(--text-mute);
		font-weight: 600;
		letter-spacing: 1px;
		white-space: nowrap;
	}
	@media (min-width: 768px) {
		.guess-slot {
			width: 64px;
			height: 64px;
		}
		.slot-orb {
			width: 46px;
			height: 46px;
		}
	}
</style>
