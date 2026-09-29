<script lang="ts">
	import type { Algorithm, Mode } from '../data/data';
	import {
		confirmClearSave,
		game,
		setAlgorithm,
		setMode,
		startGame,
		toggleTheme,
		ui
	} from '../state.svelte';
	import ElementGrid from './ElementGrid.svelte';
	import PositionGrid from './PositionGrid.svelte';
	import PresetPanels from './PresetPanels.svelte';
	import SameItemPresetGrid from './SameItemPresetGrid.svelte';
	import SegControl from './SegControl.svelte';

	const algoOptions = [
		{ val: 'minimax', label: '保 守' },
		{ val: 'entropy', label: '激 进' }
	];
	const modeOptions = [
		{ val: 'standard', label: '标 准' },
		{ val: 'sameitem', label: '相同物品' },
		{ val: 'allsame', label: '全 同' }
	];
	const captions: Record<Mode, string> = {
		standard: '标准模式：每个位置各不相同，亮点=元素与位置都对，苍白点=元素对但位置错。',
		sameitem: '相同物品模式：位置按物品分组，组内可互换，反馈仍分亮点/苍白点两项。',
		allsame: '全同模式：全部位置视为同一组，反馈只统计一个「匹配数」（元素与真实配方重合的总数）。'
	};
</script>

<aside class="sidebar" class:closed={ui.drawerClosed}>
	<div class="sidebar-header">
		<div class="sidebar-title-row">
			<div>
				<div class="sidebar-title display-font">余烬炼金计算器</div>
				<div class="sidebar-subtitle pixel-num">EMBER · ALCHEMY · 2.0</div>
			</div>
			<div class="header-actions">
				<button
					class="icon-btn"
					aria-label="切换深色/浅色主题"
					title="切换主题"
					onclick={toggleTheme}>{ui.theme === 'dark' ? '☀' : '☾'}</button
				>
			</div>
		</div>
	</div>

	<div class="settings-section" class:locked={game.running}>
		<div class="toggle-label">推演算法</div>
		<SegControl
			options={algoOptions}
			value={game.algorithm}
			ariaLabel="推演算法选择"
			locked={game.running}
			onselect={(v) => setAlgorithm(v as Algorithm)}
		/>
	</div>

	<div class="settings-section" class:locked={game.running}>
		<div class="toggle-label">配方模式</div>
		<SegControl
			options={modeOptions}
			value={game.mode}
			ariaLabel="配方模式选择"
			locked={game.running}
			onselect={(v) => setMode(v as Mode)}
		/>
		<div class="mode-caption">{captions[game.mode]}</div>
	</div>

	<PresetPanels />
	<SameItemPresetGrid />

	<div class="settings-section" class:hidden={game.mode === 'sameitem'} class:locked={game.running}>
		<div class="section-title">物品数量</div>
		<PositionGrid />
	</div>

	<div class="settings-section" class:locked={game.running}>
		<div class="section-title">元素（至少选 2 种）</div>
		<ElementGrid />
	</div>

	<button class="start-btn" type="button" disabled={game.running} onclick={startGame}>开 始 推 测</button>

	<div class="sidebar-footer">
		<button class="footer-link-btn" type="button" onclick={confirmClearSave}>清除存档</button>
	</div>
</aside>

<style>
	.sidebar {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		width: 86vw;
		max-width: 320px;
		background-color: var(--wood-dark);
		background-image:
			linear-gradient(180deg, rgba(34, 20, 10, 0.94), rgba(16, 9, 5, 0.97)),
			repeating-conic-gradient(rgba(255, 255, 255, 0.018) 0% 25%, transparent 0% 50%),
			url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><filter id='w'><feTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='2'/><feColorMatrix values='0 0 0 0 0.55 0 0 0 0 0.35 0 0 0 0 0.15 0 0 0 0.12 0'/></filter><rect width='100%' height='100%' filter='url(%23w)'/></svg>");
		background-size: auto, 4px 4px, 100px 100px;
		color: var(--cream);
		padding: 24px;
		transform: translateX(0);
		transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1);
		z-index: 80;
		box-shadow: 4px 0 24px var(--shadow);
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 14px;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}
	.sidebar.closed {
		transform: translateX(-100%);
	}
	.sidebar::-webkit-scrollbar {
		width: 0;
		height: 0;
		display: none;
	}

	.sidebar-header {
		padding-bottom: 12px;
		border-bottom: 1px solid rgba(201, 149, 68, 0.28);
		position: relative;
	}
	/* 像素刻度线：标题栏下的余烬点阵 */
	.sidebar-header::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: -5px;
		height: 2px;
		background: repeating-linear-gradient(
			90deg,
			rgba(255, 106, 31, 0.55) 0 4px,
			transparent 4px 9px
		);
		opacity: 0.5;
	}
	.sidebar-title-row {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 8px;
	}
	.sidebar-title {
		font-size: 21px;
		letter-spacing: 2px;
		background: linear-gradient(180deg, #ffe1a0 0%, var(--dawnstone) 45%, var(--ember) 90%);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		filter: drop-shadow(0 2px 0 rgba(40, 12, 0, 0.85)) drop-shadow(0 0 10px rgba(255, 120, 30, 0.3));
	}
	.sidebar-subtitle {
		font-size: 7px;
		color: var(--ash-dim);
		margin-top: 7px;
		letter-spacing: 2px;
	}
	.header-actions {
		display: flex;
		gap: 6px;
		flex-shrink: 0;
	}
	/* 深色凸起方块按钮 */
	.icon-btn {
		width: 34px;
		height: 34px;
		border-radius: 3px;
		background: linear-gradient(180deg, #26170b, #170d06);
		border: 1px solid rgba(201, 149, 68, 0.45);
		color: var(--dawnstone);
		font-size: 15px;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow:
			inset 0 1px 0 rgba(255, 190, 110, 0.18),
			inset 0 -2px 0 rgba(0, 0, 0, 0.55),
			0 2px 5px rgba(0, 0, 0, 0.4);
		transition: all 160ms ease;
		text-shadow: 0 0 8px rgba(242, 193, 78, 0.5);
	}
	.icon-btn:active {
		transform: translateY(1px) scale(0.95);
		background: linear-gradient(180deg, #170d06, #26170b);
		box-shadow:
			inset 0 2px 4px rgba(0, 0, 0, 0.6),
			0 0 10px rgba(255, 106, 31, 0.25);
	}

	/* 余烬主按钮：凸起热铁方块 */
	.start-btn {
		width: 100%;
		padding: 14px;
		background: linear-gradient(180deg, #ff8a30 0%, var(--ember) 45%, var(--ember-deep) 100%);
		border: 2px solid #31170a;
		border-radius: 3px;
		color: #fff3d8;
		font-family: 'ZCOOL QingKe HuangYou', 'PingFang SC', 'Microsoft YaHei', sans-serif;
		font-size: 16px;
		letter-spacing: 5px;
		text-shadow: 0 2px 0 rgba(70, 20, 0, 0.65);
		box-shadow:
			inset 0 2px 0 rgba(255, 210, 130, 0.5),
			inset 0 -3px 0 rgba(110, 30, 0, 0.55),
			0 0 16px rgba(255, 106, 31, 0.35),
			0 4px 10px var(--shadow);
		transition: all 180ms ease;
		margin-top: auto;
	}
	.start-btn:hover:not(:disabled) {
		filter: brightness(1.08);
		box-shadow:
			inset 0 2px 0 rgba(255, 210, 130, 0.5),
			inset 0 -3px 0 rgba(110, 30, 0, 0.55),
			0 0 24px rgba(255, 106, 31, 0.55),
			0 4px 10px var(--shadow);
	}
	.start-btn:active {
		transform: translateY(2px);
		box-shadow:
			inset 0 2px 5px rgba(90, 20, 0, 0.6),
			0 0 10px rgba(255, 106, 31, 0.3);
	}
	.start-btn:disabled {
		filter: grayscale(0.55) brightness(0.7);
		box-shadow:
			inset 0 2px 0 rgba(255, 210, 130, 0.2),
			inset 0 -3px 0 rgba(110, 30, 0, 0.35);
	}

	.sidebar-footer {
		display: flex;
		gap: 8px;
		justify-content: center;
	}
	.footer-link-btn {
		background: none;
		border: none;
		color: var(--ash-dim);
		font-size: 10.5px;
		letter-spacing: 2px;
		text-decoration: underline;
		padding: 4px;
	}
	.footer-link-btn:active {
		color: var(--dawnstone);
	}

	@media (min-width: 768px) {
		.sidebar {
			position: sticky;
			top: 0;
			height: 100vh;
			/* 与右侧等宽 */
			flex: 1 1 0;
			width: auto;
			max-width: none;
			flex-shrink: 0;
			transform: none !important;
			/* 古砖机械台板：四角铆钉 + 余烬缝 + 砖石纹理 */
			background-color: var(--wood-dark);
			background-image:
				radial-gradient(circle 4px at 22px 22px, #f0d08a 0%, #8a5f28 55%, transparent 60%),
				radial-gradient(circle 4px at calc(100% - 30px) 22px, #f0d08a 0%, #8a5f28 55%, transparent 60%),
				radial-gradient(circle 4px at 22px calc(100% - 22px), #f0d08a 0%, #8a5f28 55%, transparent 60%),
				radial-gradient(circle 4px at calc(100% - 30px) calc(100% - 22px), #f0d08a 0%, #8a5f28 55%, transparent 60%),
				linear-gradient(90deg, transparent, rgba(255, 140, 60, 0.05) 92%, rgba(255, 106, 31, 0.14)),
				linear-gradient(180deg, rgba(12, 7, 4, 0.78), rgba(16, 9, 5, 0.88)),
				url('/textures/block_archaic_bricks.png');
			background-repeat: no-repeat, no-repeat, no-repeat, no-repeat, repeat, repeat, repeat;
			background-size: auto, auto, auto, auto, auto, auto, 64px 64px;
			image-rendering: pixelated;
		}
		/* 台板内嵌黄铜细框 */
		.sidebar::before {
			content: '';
			position: absolute;
			inset: 12px 20px 12px 12px;
			border: 1px solid rgba(201, 149, 68, 0.3);
			outline: 1px solid rgba(201, 149, 68, 0.12);
			outline-offset: 3px;
			border-radius: 2px;
			pointer-events: none;
		}
	}
</style>
