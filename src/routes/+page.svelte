<script lang="ts">
	import { onMount } from 'svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import FeedbackCard from '$lib/components/FeedbackCard.svelte';
	import GuessCard from '$lib/components/GuessCard.svelte';
	import HistoryList from '$lib/components/HistoryList.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import SuccessBanner from '$lib/components/SuccessBanner.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import {
		reset,
		closeDrawer,
		exportTranscript,
		game,
		initGame,
		submitFeedback,
		toggleDrawer,
		ui
	} from '$lib/state.svelte';

	const standardRows = [
		{
			key: 'highlight' as const,
			name: '亮点',
			tip: '元素与位置都对',
			orbClass: 'highlight' as const,
			tapAriaLabel: '选择亮点数量'
		},
		{
			key: 'pale' as const,
			name: '苍白点',
			tip: '元素对但位置错',
			orbClass: 'pale' as const,
			tapAriaLabel: '选择苍白点数量'
		}
	];
	const allSameRows = [
		{
			key: 'match' as const,
			name: '匹配数',
			tip: '猜测与真实配方重合的元素总数',
			orbClass: 'highlight' as const,
			tapAriaLabel: '选择匹配数量'
		}
	];

	let inGame = $derived(game.running || game.finished);
	let itemPattern = $derived(
		game.mode === 'sameitem' ? game.sameItemPreset : game.mode === 'allsame' ? '全同' : '标准'
	);

	onMount(() => {
		initGame();
	});

	function onResize() {
		if (window.innerWidth >= 768) ui.drawerClosed = false;
	}
</script>

<svelte:window onresize={onResize} />

<div class="app-shell">
	<button
		class="drawer-toggle"
		aria-label="打开设置面板"
		aria-expanded={ui.drawerClosed ? 'false' : 'true'}
		onclick={toggleDrawer}>⚗</button
	>
	<div
		class="drawer-mask"
		class:hidden={ui.maskHidden}
		onclick={closeDrawer}
		role="presentation"
	></div>

	<Sidebar />

	<main class="main-stage">
		<div class="stage-header">
			<div class="stage-title display-font">炼 金 推 演 台</div>
			<div class="stage-hint">根据反馈录入亮点与苍白点 · 余烬将收敛出真名</div>
		</div>

		{#if !inGame}
			<div class="empty-stage">
				<div class="empty-rune">⚗</div>
				<div class="empty-hint">请于左侧设置参数 · 点击「开始推测」</div>
				<div class="resume-hint hidden"></div>
			</div>
		{:else}
			<div class="play-stage">
				<div class="action-row">
					<button class="action-btn" type="button" onclick={exportTranscript}>📋 分享 / 导出记录</button>
					<button class="action-btn" type="button" onclick={() => reset()}>↺ 重置 / 新对局</button>
				</div>

				<div class="status-line">
					<div class="status-item">
						<span class="status-key">回合</span><span class="status-val">{game.round}</span>
					</div>
					<div class="status-item">
						<span class="status-key">剩余可能</span><span class="status-val">{game.S.length}</span>
					</div>
					<div class="status-item">
						<span class="status-key">物品</span><span class="status-val small">{itemPattern}</span>
					</div>
					<div class="status-item">
						<span class="status-key">算法</span><span class="status-val small"
							>{game.algorithm === 'minimax' ? '保守' : '激进'}</span
						>
					</div>
				</div>

				{#if game.finished && game.revealedSecret}
					<SuccessBanner />
				{/if}

				<GuessCard />
				<HistoryList />

				{#if !game.finished}
					{#if game.mode !== 'allsame'}
						<FeedbackCard rows={standardRows} />
					{:else}
						<FeedbackCard rows={allSameRows} />
					{/if}
				{/if}

				{#if game.computing}
					<div class="computing-panel">
						<div class="computing-label">余烬推演中</div>
						<div class="computing-track"><div class="computing-fill"></div></div>
					</div>
				{/if}

				{#if !game.finished}
					<button class="submit-btn" type="button" disabled={game.computing} onclick={submitFeedback}
						>提 交 反 馈</button
					>
				{/if}
			</div>
		{/if}
	</main>
</div>

<Toast />
<ConfirmDialog />

<style>
	.app-shell {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		position: relative;
	}

	.drawer-toggle {
		position: fixed;
		top: 14px;
		left: 14px;
		width: 44px;
		height: 44px;
		background: linear-gradient(135deg, var(--wood-mid), var(--wood-dark));
		border: 1px solid var(--gold);
		border-radius: 8px;
		color: var(--gold);
		font-size: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 70;
		box-shadow: 0 2px 8px var(--shadow);
		transition: transform 200ms ease;
	}
	.drawer-toggle:active {
		transform: scale(0.92);
	}

	.drawer-mask {
		position: fixed;
		inset: 0;
		background: rgba(26, 15, 8, 0.55);
		opacity: 1;
		pointer-events: auto;
		transition: opacity 280ms ease;
		z-index: 70;
	}
	.drawer-mask.hidden {
		opacity: 0;
		pointer-events: none;
	}

	.main-stage {
		flex: 1;
		padding: 70px 16px 24px;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		gap: 14px;
		max-width: 720px;
		margin: 0 auto;
		width: 100%;
		/* 羊皮纸质感 · 中世纪神秘学手稿 */
		background-color: var(--parchment);
		background-image:
			radial-gradient(ellipse at 18% 12%, rgba(139, 58, 31, 0.10), transparent 55%),
			radial-gradient(ellipse at 82% 88%, rgba(90, 58, 26, 0.12), transparent 55%),
			radial-gradient(ellipse at center, rgba(255, 246, 220, 0.35), rgba(196, 168, 110, 0.28)),
			url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='p'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' seed='11'/><feColorMatrix values='0 0 0 0 0.45 0 0 0 0 0.33 0 0 0 0 0.17 0 0 0 0.16 0'/></filter><rect width='100%' height='100%' filter='url(%23p)'/></svg>");
		background-attachment: fixed;
	}

	/* 深色主题：午夜古卷质感（保留纤维纹理，整体压暗） */
	:global([data-theme='dark']) .main-stage {
		background-color: #1a120b;
		background-image:
			radial-gradient(ellipse at 18% 12%, rgba(210, 105, 30, 0.07), transparent 55%),
			radial-gradient(ellipse at 82% 88%, rgba(139, 58, 31, 0.10), transparent 55%),
			radial-gradient(ellipse at center, rgba(62, 44, 26, 0.35), rgba(16, 10, 5, 0.45)),
			url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='p'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' seed='11'/><feColorMatrix values='0 0 0 0 0.55 0 0 0 0 0.42 0 0 0 0 0.24 0 0 0 0.10 0'/></filter><rect width='100%' height='100%' filter='url(%23p)'/></svg>");
	}

	.stage-header {
		text-align: center;
		flex-shrink: 0;
	}
	.stage-title {
		font-size: 22px;
		font-weight: 700;
		color: var(--text-ink);
		letter-spacing: 4px;
	}
	.stage-hint {
		font-size: 11px;
		color: var(--text-mute);
		margin-top: 6px;
		opacity: 0.8;
		letter-spacing: 1px;
	}

	.empty-stage {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 16px;
		color: var(--text-mute);
		text-align: center;
		padding: 40px 20px;
	}
	.empty-rune {
		font-size: 64px;
		color: var(--brass);
		opacity: 0.6;
		animation: pulse 2.4s ease-in-out infinite;
	}
	@keyframes pulse {
		0%,
		100% {
			opacity: 0.4;
			transform: scale(1);
		}
		50% {
			opacity: 0.75;
			transform: scale(1.08);
		}
	}
	.empty-hint {
		font-size: 13px;
		letter-spacing: 2px;
	}
	.resume-hint {
		font-size: 11.5px;
		color: var(--ember-red);
		letter-spacing: 1px;
	}

	.play-stage {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 14px;
		min-height: 0;
	}

	.action-row {
		display: flex;
		gap: 8px;
		flex-shrink: 0;
	}
	.action-btn {
		flex: 1;
		padding: 9px 6px;
		background: rgba(244, 236, 216, var(--glass-alpha));
		backdrop-filter: blur(var(--glass-blur));
		-webkit-backdrop-filter: blur(var(--glass-blur));
		border: 1px solid var(--card-border);
		border-radius: 7px;
		color: var(--text-ink);
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 1px;
		transition: all 180ms ease;
	}
	.action-btn:active {
		transform: scale(0.96);
	}

	.status-line {
		display: flex;
		justify-content: space-around;
		gap: 8px;
		padding: 10px 12px;
		background: var(--status-bg);
		backdrop-filter: blur(var(--glass-blur));
		-webkit-backdrop-filter: blur(var(--glass-blur));
		border: 1px solid rgba(166, 124, 63, 0.25);
		border-radius: 8px;
		flex-shrink: 0;
	}
	.status-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		flex: 1;
	}
	.status-key {
		font-size: 10px;
		color: var(--text-mute);
		letter-spacing: 1px;
	}
	.status-val {
		font-size: 16px;
		font-weight: 700;
		color: var(--ember-red);
	}
	.status-val.small {
		font-size: 12px;
	}

	.computing-panel {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 10px 4px 2px;
	}
	.computing-label {
		color: var(--text-mute);
		font-size: 12.5px;
		letter-spacing: 2px;
	}
	.computing-label::after {
		content: '...';
		animation: dots 1.2s steps(4) infinite;
	}
	@keyframes dots {
		0% {
			content: '   ';
		}
		25% {
			content: '.  ';
		}
		50% {
			content: '.. ';
		}
		75% {
			content: '...';
		}
	}
	.computing-track {
		width: 100%;
		max-width: 240px;
		height: 5px;
		border-radius: 3px;
		background: rgba(166, 124, 63, 0.25);
		overflow: hidden;
	}
	.computing-fill {
		height: 100%;
		width: 40%;
		border-radius: 3px;
		background: linear-gradient(90deg, var(--ember-orange), var(--gold));
		animation: computingSlide 1.1s ease-in-out infinite;
	}
	@keyframes computingSlide {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(350%);
		}
	}

	.submit-btn {
		width: 100%;
		padding: 14px;
		background: linear-gradient(135deg, var(--ember-red) 0%, var(--ember-orange) 100%);
		border: 1px solid var(--gold);
		border-radius: 8px;
		color: var(--cream);
		font-size: 15px;
		font-weight: 700;
		letter-spacing: 3px;
		box-shadow: 0 4px 12px rgba(139, 58, 31, 0.5);
		transition: all 200ms ease;
		flex-shrink: 0;
	}
	.submit-btn:active {
		transform: translateY(2px);
		box-shadow: 0 2px 6px rgba(139, 58, 31, 0.5);
	}
	.submit-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	@media (min-width: 768px) {
		.app-shell {
			flex-direction: row;
			/* 摊开的笔记本 */
			max-width: 1560px;
			margin: 0 auto;
			width: 100%;
			box-shadow: 0 0 60px rgba(20, 10, 4, 0.5);
		}
		.drawer-toggle {
			display: none;
		}
		.drawer-mask {
			display: none !important;
		}
		.main-stage {
			/* 与左侧等宽 */
			flex: 1 1 0;
			min-width: 0;
			position: relative;
			padding: 40px 56px 32px;
			margin: 0;
			max-width: none;
			min-height: 100vh;
			background-attachment: local;
		}
		/* 书籍装订中缝（靠左缘的内凹阴影 + 一道金线） */
		.main-stage::before {
			content: '';
			position: absolute;
			top: 0;
			bottom: 0;
			left: 0;
			width: 26px;
			pointer-events: none;
			background: linear-gradient(
				to right,
				rgba(20, 10, 4, 0.55),
				rgba(42, 24, 16, 0.22) 40%,
				rgba(42, 24, 16, 0) 100%
			);
		}
		.main-stage::after {
			content: '';
			position: absolute;
			top: 0;
			bottom: 0;
			left: 26px;
			width: 1px;
			pointer-events: none;
			background: linear-gradient(
				to bottom,
				rgba(201, 169, 97, 0),
				rgba(201, 169, 97, 0.5) 12%,
				rgba(201, 169, 97, 0.5) 88%,
				rgba(201, 169, 97, 0)
			);
		}
		.stage-title {
			font-size: 28px;
		}
	}
</style>
