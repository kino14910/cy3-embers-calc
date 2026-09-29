<script lang="ts">
	import { elementLabelFor, game, orbGradient } from '../state.svelte';

	function spawnCelebration(container: HTMLElement) {
		// 余烬喷发：方形火花粒子
		const colors = ['#FFB340', '#FF6A1F', '#F2C14E', '#C63E10', '#F3E7CD'];
		for (let i = 0; i < 18; i++) {
			const p = document.createElement('div');
			p.className = 'burst-particle';
			const angle = (Math.PI * 2 * i) / 18 + Math.random() * 0.3;
			const dist = 60 + Math.random() * 60;
			p.style.setProperty('--bx', `${Math.cos(angle) * dist}px`);
			p.style.setProperty('--by', `${Math.sin(angle) * dist}px`);
			p.style.background = colors[i % colors.length];
			p.style.animationDelay = Math.random() * 120 + 'ms';
			container.appendChild(p);
			setTimeout(() => p.remove(), 950);
		}
	}
</script>

<div class="success-banner" {@attach spawnCelebration}>
	<div class="success-title-row">
		<img class="success-spark" src="/textures/item_ember_cluster.png" alt="" aria-hidden="true" />
		<div class="success-title display-font">真名已现 · 余烬熄灭</div>
		<img class="success-spark" src="/textures/item_ember_cluster.png" alt="" aria-hidden="true" />
	</div>
	<div class="success-sub">共用 {game.history.length} 回合推演而出</div>
	<div class="success-answer-slots">
		{#each game.revealedSecret ?? [] as idx, i (i)}
			<div class="success-answer-slot">
				<div class="success-orb" style:background={orbGradient(idx)}></div>
				<div class="success-orb-name">{elementLabelFor(idx)}</div>
			</div>
		{/each}
	</div>
</div>

<style>
	/* 真名揭晓：黎明石镶板 + 余烬喷发 */
	.success-banner {
		background:
			radial-gradient(ellipse 70% 90% at 50% 115%, rgba(255, 140, 40, 0.32), transparent 62%),
			linear-gradient(180deg, #221305, #140b04);
		border: 2px solid var(--dawnstone);
		border-radius: 4px;
		padding: 18px 16px;
		text-align: center;
		color: var(--bone);
		font-weight: 700;
		box-shadow:
			0 0 24px rgba(242, 193, 78, 0.22),
			0 0 60px rgba(255, 106, 31, 0.16),
			inset 0 0 30px rgba(255, 120, 30, 0.1);
		animation: successPop 500ms cubic-bezier(0.22, 1, 0.36, 1);
		position: relative;
		overflow: hidden;
	}
	.success-title-row {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		margin-bottom: 6px;
	}
	.success-spark {
		width: 22px;
		height: 22px;
		image-rendering: pixelated;
		filter: drop-shadow(0 0 6px rgba(255, 160, 50, 0.7));
	}
	.success-title {
		font-size: 18px;
		letter-spacing: 4px;
		background: linear-gradient(180deg, #fff0c0 0%, var(--dawnstone) 50%, var(--ember) 100%);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		filter: drop-shadow(0 2px 0 rgba(40, 12, 0, 0.85)) drop-shadow(0 0 12px rgba(255, 160, 50, 0.45));
	}
	.success-sub {
		font-size: 11px;
		letter-spacing: 2px;
		color: var(--ash);
		margin-bottom: 14px;
		font-weight: 500;
	}
	.success-answer-slots {
		display: flex;
		justify-content: center;
		gap: 8px;
		flex-wrap: wrap;
		position: relative;
		z-index: 2;
	}
	.success-answer-slot {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
	}
	/* 答案宝石：方块晶体 */
	.success-orb {
		width: 38px;
		height: 38px;
		border-radius: 3px;
		border: 1px solid rgba(0, 0, 0, 0.65);
		box-shadow:
			inset 0 2px 0 rgba(255, 255, 255, 0.3),
			inset 0 -3px 0 rgba(0, 0, 0, 0.4),
			0 0 12px rgba(255, 200, 90, 0.45);
	}
	.success-orb-name {
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 1px;
	}
	@keyframes successPop {
		0% {
			transform: scale(0.7);
			opacity: 0;
		}
		60% {
			transform: scale(1.05);
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}
	.success-banner :global(.burst-particle) {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 6px;
		height: 6px;
		background: var(--ember-hot);
		pointer-events: none;
		animation: burstFly 750ms ease-out forwards;
		z-index: 1;
		box-shadow: 0 0 6px rgba(255, 160, 50, 0.8);
	}
	@keyframes burstFly {
		0% {
			transform: translate(-50%, -50%) scale(1);
			opacity: 1;
		}
		100% {
			transform: translate(var(--bx), var(--by)) scale(0);
			opacity: 0;
		}
	}
</style>
