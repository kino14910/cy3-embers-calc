<script lang="ts">
	import { elementLabelFor, game, orbGradient } from '../state.svelte';

	function spawnCelebration(container: HTMLElement) {
		const colors = ['#FFB347', '#C9A961', '#F4ECD8', '#5DADE2'];
		for (let i = 0; i < 14; i++) {
			const p = document.createElement('div');
			p.className = 'burst-particle';
			const angle = (Math.PI * 2 * i) / 14 + Math.random() * 0.3;
			const dist = 60 + Math.random() * 50;
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
	<div class="success-title display-font">真名已现 · 余烬熄灭</div>
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
	.success-banner {
		background: linear-gradient(135deg, var(--gold), var(--ember-orange));
		border: 2px solid var(--cream);
		border-radius: 10px;
		padding: 16px;
		text-align: center;
		color: var(--wood-dark);
		font-weight: 700;
		box-shadow: 0 6px 20px rgba(210, 105, 30, 0.5);
		animation: successPop 500ms cubic-bezier(0.22, 1, 0.36, 1);
		position: relative;
		overflow: hidden;
	}
	.success-title {
		font-size: 16px;
		letter-spacing: 3px;
		margin-bottom: 4px;
	}
	.success-sub {
		font-size: 11px;
		letter-spacing: 1px;
		opacity: 0.75;
		margin-bottom: 12px;
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
	.success-orb {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		border: 2px solid rgba(42, 24, 16, 0.5);
		box-shadow:
			inset 0 -3px 6px rgba(0, 0, 0, 0.35),
			inset 0 3px 6px rgba(255, 255, 255, 0.3),
			0 0 10px rgba(255, 255, 255, 0.4);
	}
	.success-orb-name {
		font-size: 10px;
		font-weight: 700;
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
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--cream);
		pointer-events: none;
		animation: burstFly 750ms ease-out forwards;
		z-index: 1;
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
