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
		game.active.mode === 'sameitem'
			? game.active.sameItemPreset
			: game.active.mode === 'allsame'
				? '全同'
				: '标准'
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
		onclick={toggleDrawer}
		><img class="toggle-sprite" src="/textures/item_ember_dial.png" alt="" /></button
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
				<img
					class="empty-crystal"
					src="/textures/item_ember_cluster.png"
					alt=""
					aria-hidden="true"
				/>
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
							>{game.active.algorithm === 'minimax' ? '保守' : '激进'}</span
						>
					</div>
				</div>

				{#if game.finished && game.revealedSecret}
					<SuccessBanner />
				{/if}

				<GuessCard />
				<HistoryList />

				{#if !game.finished}
					{#if game.active.mode !== 'allsame'}
						<FeedbackCard rows={standardRows} />
					{:else}
						<FeedbackCard rows={allSameRows} />
					{/if}
				{/if}

				{#if game.computing}
					<div class="computing-panel">
						<div class="computing-label">
							<img class="computing-heat" src="/textures/gui_heat_bar.png" alt="" />余烬推演中
						</div>
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

	/* 余烬晶体切换按钮：像素化暗色方块 */
	.drawer-toggle {
		position: fixed;
		top: 14px;
		left: 14px;
		width: 44px;
		height: 44px;
		background: linear-gradient(180deg, #26170b, #170d06);
		border: 1px solid rgba(201, 149, 68, 0.45);
		border-radius: 3px;
		color: var(--dawnstone);
		font-size: 18px;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 70;
		box-shadow:
			inset 0 1px 0 rgba(255, 190, 110, 0.18),
			inset 0 -2px 0 rgba(0, 0, 0, 0.55),
			0 2px 8px rgba(0, 0, 0, 0.45);
		transition: transform 200ms ease;
		text-shadow: 0 0 8px rgba(242, 193, 78, 0.45);
	}
	.drawer-toggle:active {
		transform: translateY(1px) scale(0.95);
	}
	.toggle-sprite {
		width: 22px;
		height: 22px;
		image-rendering: pixelated;
		filter: drop-shadow(0 0 5px rgba(255, 140, 40, 0.55));
	}

	.drawer-mask {
		position: fixed;
		inset: 0;
		background: rgba(5, 2, 1, 0.65);
		backdrop-filter: blur(2px);
		-webkit-backdrop-filter: blur(2px);
		opacity: 1;
		pointer-events: auto;
		transition: opacity 280ms ease;
		z-index: 70;
	}
	.drawer-mask.hidden {
		opacity: 0;
		pointer-events: none;
	}

	/* 主舞台 = 熔炉台面（砖纹 + 余烬漫射） */
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
		background-color: #140b06;
		background-image:
			/* 地心余烬（自下而上漫射） */
			radial-gradient(ellipse 90% 40% at 50% 110%, rgba(255, 106, 31, 0.18), transparent 62%),
			radial-gradient(ellipse at 18% 12%, rgba(210, 105, 30, 0.08), transparent 55%),
			radial-gradient(ellipse at 82% 88%, rgba(139, 58, 31, 0.10), transparent 55%),
			/* 暗化叠层 + 砖纹 */
			linear-gradient(180deg, rgba(10, 5, 2, 0.60), rgba(10, 5, 2, 0.45)),
			url('/textures/block_caminite_bricks.png');
		background-size: auto, auto, auto, auto, 64px 64px;
		background-attachment: fixed;
		image-rendering: pixelated;
	}

	/* 浅色主题：白蜡灰烬台面（砖纹洗白） */
	:global([data-theme='light']) .main-stage {
		background-color: #CDBD97;
		background-image:
			radial-gradient(ellipse 90% 40% at 50% 110%, rgba(255, 106, 31, 0.09), transparent 62%),
			radial-gradient(ellipse at 18% 12%, rgba(210, 105, 30, 0.06), transparent 55%),
			radial-gradient(ellipse at 82% 88%, rgba(139, 58, 31, 0.09), transparent 55%),
			linear-gradient(180deg, rgba(221, 208, 169, 0.74), rgba(202, 189, 147, 0.62)),
			url('/textures/block_caminite_bricks.png');
	}

	.stage-header {
		text-align: center;
		flex-shrink: 0;
	}
	.stage-title {
		font-size: 24px;
		color: var(--text-ink);
		letter-spacing: 5px;
		background: linear-gradient(180deg, #ffe1a0 0%, var(--dawnstone) 45%, var(--ember) 90%);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		filter: drop-shadow(0 2px 0 rgba(40, 12, 0, 0.9)) drop-shadow(0 0 10px rgba(255, 120, 30, 0.3));
	}
	.stage-hint {
		font-size: 11px;
		color: var(--text-mute);
		margin-top: 6px;
		letter-spacing: 2px;
		text-shadow: 0 0 6px rgba(255, 140, 40, 0.15);
	}

	.empty-stage {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 18px;
		color: var(--text-mute);
		text-align: center;
		padding: 40px 20px;
	}
	/* 待机态：真实余烬晶簇精灵图 */
	.empty-crystal {
		width: 64px;
		height: 64px;
		image-rendering: pixelated;
		filter:
			drop-shadow(0 0 10px rgba(255, 106, 31, 0.55))
			drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5));
		animation: crystalPulse 2.6s ease-in-out infinite;
	}
	@keyframes crystalPulse {
		0%,
		100% {
			opacity: 0.6;
			filter: drop-shadow(0 0 8px rgba(255, 106, 31, 0.4)) drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5)) brightness(0.9);
		}
		50% {
			opacity: 1;
			filter: drop-shadow(0 0 16px rgba(255, 106, 31, 0.75)) drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5)) brightness(1.15);
		}
	}
	.empty-hint {
		font-size: 12.5px;
		letter-spacing: 3px;
		color: var(--ash);
	}
	.resume-hint {
		font-size: 11.5px;
		color: var(--ember-hot);
		letter-spacing: 1px;
	}

	.play-stage {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 14px;
		min-height: 0;
	}

	/* 操作按钮组：暗色凸起方块 */
	.action-row {
		display: flex;
		gap: 8px;
		flex-shrink: 0;
	}
	.action-btn {
		flex: 1;
		padding: 10px 6px;
		background: linear-gradient(180deg, var(--card-top), var(--card-bottom));
		border: 1px solid var(--card-border);
		border-radius: 3px;
		color: var(--text-ink);
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 1px;
		box-shadow:
			inset 0 1px 0 rgba(255, 190, 110, 0.1),
			inset 0 -2px 0 rgba(0, 0, 0, 0.4),
			0 2px 5px rgba(0, 0, 0, 0.35);
		transition: all 180ms ease;
	}
	.action-btn:hover {
		border-color: var(--dawnstone);
		box-shadow:
			inset 0 1px 0 rgba(255, 210, 130, 0.2),
			inset 0 -2px 0 rgba(0, 0, 0, 0.4),
			0 0 12px rgba(255, 106, 31, 0.25);
	}
	.action-btn:active {
		transform: translateY(1px) scale(0.97);
		box-shadow:
			inset 0 2px 4px rgba(0, 0, 0, 0.5);
	}

	/* 状态栏：机件读数盘 */
	.status-line {
		display: flex;
		justify-content: space-around;
		gap: 8px;
		padding: 10px 12px;
		background: var(--status-bg);
		border: 1px solid var(--card-border);
		border-radius: 3px;
		flex-shrink: 0;
		box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.45);
	}
	.status-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 3px;
		flex: 1;
	}
	.status-key {
		font-size: 9px;
		color: var(--text-mute);
		letter-spacing: 2px;
		text-transform: uppercase;
	}
	.status-val {
		font-size: 14px;
		font-weight: 700;
		color: var(--num-hot);
		font-family: 'Press Start 2P', 'Courier New', monospace;
		letter-spacing: 1px;
		text-shadow: 0 0 8px rgba(255, 140, 40, 0.45);
	}
	.status-val.small {
		font-size: 10px;
		font-family: 'ZCOOL QingKe HuangYou', 'PingFang SC', 'Microsoft YaHei', sans-serif;
		text-shadow: none;
	}

	/* 推演中：余烬能量管 */
	.computing-panel {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 10px 4px 2px;
	}
	.computing-label {
		color: var(--ash);
		font-size: 12.5px;
		letter-spacing: 2px;
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.computing-heat {
		width: 16px;
		height: 16px;
		image-rendering: pixelated;
		filter: drop-shadow(0 0 4px rgba(255, 106, 31, 0.6));
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
		border-radius: 1px;
		background: #0a0502;
		border: 1px solid rgba(201, 149, 68, 0.25);
		overflow: hidden;
		box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.8);
	}
	.computing-fill {
		height: 100%;
		width: 40%;
		background: linear-gradient(90deg, var(--ember-deep), var(--ember), var(--ember-hot));
		animation: computingSlide 1.1s ease-in-out infinite;
		box-shadow: 0 0 10px rgba(255, 106, 31, 0.6);
	}
	@keyframes computingSlide {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(350%);
		}
	}

	/* 提交按钮：炽热余烬铸块 */
	.submit-btn {
		width: 100%;
		padding: 14px;
		background: linear-gradient(180deg, #ff8a30 0%, var(--ember) 45%, var(--ember-deep) 100%);
		border: 2px solid #31170a;
		border-radius: 3px;
		color: #fff3d8;
		font-family: 'ZCOOL QingKe HuangYou', 'PingFang SC', 'Microsoft YaHei', sans-serif;
		font-size: 16px;
		letter-spacing: 4px;
		text-shadow: 0 2px 0 rgba(70, 20, 0, 0.65);
		box-shadow:
			inset 0 2px 0 rgba(255, 210, 130, 0.5),
			inset 0 -3px 0 rgba(110, 30, 0, 0.55),
			0 0 18px rgba(255, 106, 31, 0.4),
			0 4px 10px var(--shadow);
		transition: all 180ms ease;
		flex-shrink: 0;
	}
	.submit-btn:hover:not(:disabled) {
		filter: brightness(1.08);
		box-shadow:
			inset 0 2px 0 rgba(255, 210, 130, 0.5),
			inset 0 -3px 0 rgba(110, 30, 0, 0.55),
			0 0 26px rgba(255, 106, 31, 0.6),
			0 4px 10px var(--shadow);
	}
	.submit-btn:active {
		transform: translateY(2px);
		box-shadow:
			inset 0 2px 5px rgba(90, 20, 0, 0.6),
			0 0 10px rgba(255, 106, 31, 0.3);
	}
	.submit-btn:disabled {
		opacity: 0.45;
		cursor: not-allowed;
		filter: grayscale(0.55) brightness(0.7);
		box-shadow:
			inset 0 2px 0 rgba(255, 210, 130, 0.2),
			inset 0 -3px 0 rgba(110, 30, 0, 0.35);
	}

	@media (min-width: 768px) {
		.app-shell {
			flex-direction: row;
			max-width: 1560px;
			margin: 0 auto;
			width: 100%;
			box-shadow: 0 0 60px rgba(0, 0, 0, 0.55);
		}
		.drawer-toggle {
			display: none;
		}
		.drawer-mask {
			display: none !important;
		}
		.main-stage {
			flex: 1 1 0;
			min-width: 0;
			position: relative;
			padding: 40px 56px 32px;
			margin: 0;
			max-width: none;
			min-height: 100vh;
			background-attachment: local;
		}
		/* 熔炉左侧：炽红余烬缝 */
		.main-stage::before {
			content: '';
			position: absolute;
			top: 0;
			bottom: 0;
			left: 0;
			width: 30px;
			pointer-events: none;
			background: linear-gradient(
				to right,
				rgba(5, 2, 1, 0.75),
				rgba(255, 100, 20, 0.10) 12%,
				rgba(255, 80, 10, 0.04) 50%,
				rgba(42, 24, 16, 0) 100%
			);
		}
		.main-stage::after {
			content: '';
			position: absolute;
			top: 0;
			bottom: 0;
			left: 30px;
			width: 1px;
			pointer-events: none;
			background: linear-gradient(
				to bottom,
				rgba(255, 106, 31, 0),
				rgba(255, 106, 31, 0.45) 12%,
				rgba(255, 106, 31, 0.45) 88%,
				rgba(255, 106, 31, 0)
			);
		}
		.stage-title {
			font-size: 30px;
		}
	}
</style>
