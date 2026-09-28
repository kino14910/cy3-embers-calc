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
				<div class="sidebar-subtitle">EMBER · ALCHEMY · 2.0</div>
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
		background-image:
			linear-gradient(180deg, rgba(42, 24, 16, 0.96), rgba(60, 36, 24, 0.96)),
			url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><filter id='w'><feTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='2'/><feColorMatrix values='0 0 0 0 0.6 0 0 0 0 0.45 0 0 0 0 0.25 0 0 0 0.15 0'/></filter><rect width='100%' height='100%' filter='url(%23w)'/></svg>");
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
		border-bottom: 1px solid rgba(201, 169, 97, 0.3);
	}
	.sidebar-title-row {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 8px;
	}
	.sidebar-title {
		font-size: 18px;
		font-weight: 700;
		color: var(--gold);
		letter-spacing: 1px;
	}
	.sidebar-subtitle {
		font-size: 10px;
		color: rgba(244, 236, 216, 0.5);
		margin-top: 4px;
		letter-spacing: 3px;
	}
	.header-actions {
		display: flex;
		gap: 6px;
		flex-shrink: 0;
	}
	.icon-btn {
		width: 34px;
		height: 34px;
		border-radius: 7px;
		background: rgba(244, 236, 216, 0.08);
		border: 1px solid rgba(201, 169, 97, 0.35);
		color: var(--gold);
		font-size: 15px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 180ms ease;
	}
	.icon-btn:active {
		transform: scale(0.9);
		background: rgba(201, 169, 97, 0.25);
	}

	.start-btn {
		width: 100%;
		padding: 14px;
		background: linear-gradient(135deg, var(--ember-orange) 0%, var(--ember-red) 100%);
		border: 1px solid var(--gold);
		border-radius: 8px;
		color: var(--cream);
		font-size: 15px;
		font-weight: 700;
		letter-spacing: 3px;
		box-shadow: 0 4px 12px rgba(139, 58, 31, 0.5);
		transition: all 200ms ease;
		margin-top: auto;
	}
	.start-btn:active {
		transform: translateY(2px);
		box-shadow: 0 2px 6px rgba(139, 58, 31, 0.5);
	}
	.start-btn:disabled {
		opacity: 0.5;
	}

	.sidebar-footer {
		display: flex;
		gap: 8px;
		justify-content: center;
	}
	.footer-link-btn {
		background: none;
		border: none;
		color: rgba(244, 236, 216, 0.4);
		font-size: 10.5px;
		letter-spacing: 1px;
		text-decoration: underline;
		padding: 4px;
	}
	.footer-link-btn:active {
		color: var(--gold);
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
			/* border-right: 2px solid #6B4A2B; */
			/* 牛皮笔记本封面质感 */
			background-color: #33241A;
			background-image:
				radial-gradient(ellipse at 50% 0%, rgba(120, 84, 52, 0.35), transparent 60%),
				radial-gradient(ellipse at center, rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0.4)),
				linear-gradient(180deg, rgba(74, 51, 34, 0.55), rgba(43, 28, 18, 0.7)),
				url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='l'><feTurbulence type='fractalNoise' baseFrequency='0.55' numOctaves='4' seed='7'/><feColorMatrix values='0 0 0 0 0.16 0 0 0 0 0.10 0 0 0 0 0.05 0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23l)'/></svg>");
		}
		/* 封面烫金双线框 */
		.sidebar::before {
			content: '';
			position: absolute;
			inset: 12px 20px 12px 12px;
			border: 1px solid rgba(201, 169, 97, 0.35);
			outline: 1px solid rgba(201, 169, 97, 0.14);
			outline-offset: 3px;
			border-radius: 3px;
			pointer-events: none;
		}
	}
</style>
