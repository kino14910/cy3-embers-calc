import { browser } from '$app/environment';
import { tick } from 'svelte';
import type { Algorithm, Feedback, Mode } from './data/data';
import { CLASSIC_PRESETS, ELEMENTS, SAME_ITEM_PRESETS } from './data/data';
import { chooseGuess, generateAllCombos, getFeedback, type HistoryRound } from './engine/engine';

const SAVE_GAME_KEY = 'ember_alchemy_v2_game';
const SAVE_PREFS_KEY = 'ember_alchemy_v2_prefs';

export interface GameState {
	algorithm: Algorithm;
	mode: Mode;
	positions: number;
	items: string[];
	sameItemPreset: string;
	classicPreset: string | null;
	enabledColors: number[];
	elementLabels: Record<number, string> | null;
	S: number[][];
	allCombos: number[][];
	currentGuess: number[] | null;
	history: HistoryRound[];
	highlight: number;
	pale: number;
	matchCount: number;
	running: boolean;
	finished: boolean;
	round: number;
	revealedSecret: number[] | null;
	computing: boolean;
}

export const game: GameState = $state({
	algorithm: 'minimax',
	mode: 'standard',
	positions: 4,
	items: ['A', 'B', 'C', 'D'],
	sameItemPreset: 'AABB',
	classicPreset: null,
	enabledColors: [],
	elementLabels: null,
	S: [],
	allCombos: [],
	currentGuess: null,
	history: [],
	highlight: 0,
	pale: 0,
	matchCount: 0,
	running: false,
	finished: false,
	round: 0,
	revealedSecret: null,
	computing: false
});

export const ui = $state({
	theme: 'light' as 'light' | 'dark',
	drawerClosed: false,
	maskHidden: true,
	toast: { msg: '', error: false, show: false },
	dialog: { msg: '', show: false, onConfirm: null as null | (() => void) }
});

let toastTimer: ReturnType<typeof setTimeout> | undefined;

// ==================== DOM 引用注册（由组件 attachment 写入，用于滚动副作用） ====================
let historyCardEl: HTMLElement | null = null;

export function registerHistoryCard(el: HTMLElement | null) {
	historyCardEl = el;
}

function scrollHistoryToBottom() {
	tick().then(() => {
		if (historyCardEl) historyCardEl.scrollTop = historyCardEl.scrollHeight;
	});
}

// ==================== 工具函数 ====================
export function showToast(msg: string, opts: { error?: boolean; duration?: number } = {}) {
	ui.toast.msg = msg;
	ui.toast.error = !!opts.error;
	ui.toast.show = true;
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => (ui.toast.show = false), opts.duration || 2000);
}

export function lighten(hex: string, amount = 60): string {
	const c = hex.replace('#', '');
	const r = Math.min(255, parseInt(c.slice(0, 2), 16) + amount);
	const g = Math.min(255, parseInt(c.slice(2, 4), 16) + amount);
	const b = Math.min(255, parseInt(c.slice(4, 6), 16) + amount);
	return `rgb(${r},${g},${b})`;
}

export function darken(hex: string, amount = 40): string {
	const c = hex.replace('#', '');
	const r = Math.max(0, parseInt(c.slice(0, 2), 16) - amount);
	const g = Math.max(0, parseInt(c.slice(2, 4), 16) - amount);
	const b = Math.max(0, parseInt(c.slice(4, 6), 16) - amount);
	return `rgb(${r},${g},${b})`;
}

export function getContrastColor(hex: string): string {
	const c = hex.replace('#', '');
	const r = parseInt(c.slice(0, 2), 16);
	const g = parseInt(c.slice(2, 4), 16);
	const b = parseInt(c.slice(4, 6), 16);
	const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	return lum > 0.55 ? '#2A1810' : '#F4ECD8';
}

export function elementLabelFor(idx: number): string {
	if (game.elementLabels && game.elementLabels[idx]) return game.elementLabels[idx];
	return ELEMENTS[idx].name;
}

export function orbGradient(idx: number): string {
	const e = ELEMENTS[idx];
	return `radial-gradient(circle at 30% 30%, ${lighten(e.color)}, ${e.color}, ${darken(e.color)})`;
}

function feedbackEquals(fb: number | number[], target: number | number[]): boolean {
	if (typeof fb === 'number') return fb === target;
	const t = target as number[];
	return fb[0] === t[0] && fb[1] === t[1];
}

// 生成默认 items（每个位置独立分组：标准模式 / 全同模式共用的位置标签）
export function defaultItemsFor(mode: Mode, positions: number): string[] {
	if (mode === 'allsame') return new Array(positions).fill('A');
	const arr: string[] = [];
	for (let i = 0; i < positions; i++) arr.push(String.fromCharCode(65 + i));
	return arr;
}

// ==================== 异步推演入口 ====================
async function computeNextGuess(computeState: Parameters<typeof chooseGuess>[0]) {
	return await Promise.resolve(chooseGuess(computeState));
}

function buildComputeState() {
	return {
		S: game.S,
		allCombos: game.allCombos,
		mode: game.mode,
		positions: game.positions,
		itemLabels: game.items,
		colors: game.enabledColors,
		algorithm: game.algorithm,
		history: game.history
	};
}

// ==================== localStorage 存取 ====================
function loadPrefs(): Record<string, string> {
	try {
		const raw = localStorage.getItem(SAVE_PREFS_KEY);
		return raw ? JSON.parse(raw) : {};
	} catch (e) {
		return {};
	}
}

export function savePrefs() {
	try {
		localStorage.setItem(
			SAVE_PREFS_KEY,
			JSON.stringify({
				theme: ui.theme,
				algorithm: game.algorithm,
				mode: game.mode,
				sameItemPreset: game.sameItemPreset,
				classicPreset: game.classicPreset
			})
		);
	} catch (e) {
		/* localStorage 不可用（隐私模式等）时静默忽略 */
	}
}

export function saveGame() {
	try {
		localStorage.setItem(
			SAVE_GAME_KEY,
			JSON.stringify({
				version: 2,
				mode: game.mode,
				algorithm: game.algorithm,
				positions: game.positions,
				items: game.items,
				sameItemPreset: game.sameItemPreset,
				classicPreset: game.classicPreset,
				enabledColors: game.enabledColors,
				elementLabels: game.elementLabels,
				history: game.history,
				currentGuess: game.currentGuess,
				round: game.round,
				running: game.running,
				finished: game.finished,
				revealedSecret: game.revealedSecret
			})
		);
	} catch (e) {
		/* ignore */
	}
}

export function clearSavedGame() {
	try {
		localStorage.removeItem(SAVE_GAME_KEY);
	} catch (e) {
		/* ignore */
	}
}

// 依据存档 + getFeedback 重放历史，恢复 S（不持久化庞大的候选数组本身）
export function tryResumeGame(): boolean {
	let raw: string | null;
	try {
		raw = localStorage.getItem(SAVE_GAME_KEY);
	} catch (e) {
		return false;
	}
	if (!raw) return false;
	let saved: any;
	try {
		saved = JSON.parse(raw);
	} catch (e) {
		clearSavedGame();
		return false;
	}
	if (!saved || (!saved.running && !saved.finished)) return false;

	try {
		game.mode = saved.mode;
		game.algorithm = saved.algorithm;
		game.positions = saved.positions;
		game.items = saved.items;
		game.sameItemPreset = saved.sameItemPreset;
		game.classicPreset = saved.classicPreset;
		game.enabledColors = saved.enabledColors;
		game.elementLabels = saved.elementLabels;
		game.round = saved.round;
		game.running = saved.running;
		game.finished = saved.finished;

		game.allCombos = generateAllCombos(game.mode, game.positions, game.enabledColors, game.items);
		let S = game.allCombos.slice();
		const history: HistoryRound[] = [];
		for (const h of saved.history || []) {
			const newS = S.filter((s) => feedbackEquals(getFeedback(h.guess, s, game.mode, game.items), h.feedback));
			if (newS.length === 0) throw new Error('存档回放矛盾');
			S = newS;
			history.push({ guess: h.guess, feedback: h.feedback, remainAfter: newS.length });
		}
		game.history = history;
		game.S = S;
		game.currentGuess = saved.currentGuess || (S.length ? S[0] : null);
		if (game.finished) {
			game.revealedSecret = saved.revealedSecret || (S.length === 1 ? S[0] : null);
		}
		return true;
	} catch (e) {
		clearSavedGame();
		return false;
	}
}

// ==================== 设置操作 ====================
export function applyClassicPreset(name: string) {
	if (game.running) return;
	const p = CLASSIC_PRESETS[name];
	if (!p) return;
	game.classicPreset = name;
	game.positions = p.numItems;
	game.mode = p.allSame ? 'allsame' : 'standard';
	game.enabledColors = p.elements
		.map((elName) => ELEMENTS.findIndex((e) => e.name === elName))
		.filter((i) => i >= 0);
	const labels: Record<number, string> = {};
	p.elements.forEach((elName) => {
		const idx = ELEMENTS.findIndex((e) => e.name === elName);
		if (idx >= 0) labels[idx] = elName;
	});
	game.elementLabels = labels;
	game.items = defaultItemsFor(game.mode, game.positions);
	savePrefs();
}

export function clearClassicPreset() {
	if (game.running) return;
	game.classicPreset = null;
	game.elementLabels = null;
}

export function applySameItemPreset(name: string) {
	if (game.running) return;
	const items = SAME_ITEM_PRESETS[name];
	if (!items) return;
	game.sameItemPreset = name;
	game.items = items.slice();
	game.positions = items.length;
	savePrefs();
}

export function setAlgorithm(val: Algorithm) {
	if (game.running) return;
	game.algorithm = val;
	savePrefs();
}

export function setMode(val: Mode) {
	if (game.running) return;
	game.mode = val;
	game.classicPreset = null;
	game.elementLabels = null;
	if (game.mode === 'sameitem') {
		applySameItemPreset(game.sameItemPreset);
	} else {
		game.items = defaultItemsFor(game.mode, game.positions);
	}
	savePrefs();
}

export function setPositions(val: number) {
	if (game.running) return;
	game.positions = val;
	game.classicPreset = null;
	game.elementLabels = null;
	game.items = defaultItemsFor(game.mode, game.positions);
}

export function toggleElement(idx: number) {
	if (game.running) return;
	const pos = game.enabledColors.indexOf(idx);
	if (pos >= 0) game.enabledColors.splice(pos, 1);
	else game.enabledColors.push(idx);
	game.classicPreset = null;
}

// ==================== 主题 ====================
export function applyTheme(theme: 'light' | 'dark') {
	ui.theme = theme;
	if (browser) document.documentElement.setAttribute('data-theme', theme);
	savePrefs();
}

export function toggleTheme() {
	applyTheme(ui.theme === 'dark' ? 'light' : 'dark');
}

// ==================== 抽屉 ====================
export function openDrawer() {
	ui.drawerClosed = false;
	ui.maskHidden = false;
}
export function closeDrawer() {
	ui.drawerClosed = true;
	ui.maskHidden = true;
}
export function toggleDrawer() {
	if (ui.drawerClosed) openDrawer();
	else closeDrawer();
}

// ==================== 反馈数值录入（行内圆点直选） ====================
export function feedbackMaxFor(target: 'highlight' | 'pale' | 'match'): number {
	const n = game.positions;
	if (target === 'match') return n;
	const other = target === 'highlight' ? game.pale : game.highlight;
	return n - other;
}

export function setFeedbackValue(target: 'highlight' | 'pale' | 'match', val: number) {
	const v = Math.max(0, Math.min(val, feedbackMaxFor(target)));
	if (target === 'highlight') game.highlight = v;
	else if (target === 'pale') game.pale = v;
	else game.matchCount = v;
}

// ==================== 流程控制：开始 / 提交 / 重置 ====================
export function startGame() {
	if (game.enabledColors.length < 2) {
		showToast('请至少启用 2 种元素', { error: true });
		return;
	}
	game.allCombos = generateAllCombos(game.mode, game.positions, game.enabledColors, game.items);
	if (game.allCombos.length === 0) {
		showToast('当前设置无法生成候选组合', { error: true });
		return;
	}
	game.S = game.allCombos.slice();
	game.history = [];
	game.round = 1;
	game.highlight = 0;
	game.pale = 0;
	game.matchCount = 0;
	game.finished = false;
	game.running = true;
	game.revealedSecret = null;

	if (browser && window.innerWidth < 768) closeDrawer();

	game.currentGuess = chooseGuess(buildComputeState());
	scrollHistoryToBottom();
	saveGame();
}

function finishGame(secretGuess: number[]) {
	game.currentGuess = secretGuess;
	game.finished = true;
	game.running = false;
	game.revealedSecret = secretGuess;
	game.computing = false;
	scrollHistoryToBottom();
	showToast('真名已现 · 推演完成', { duration: 2200 });
	saveGame();
}

export async function submitFeedback() {
	let fb: Feedback;
	if (game.mode === 'allsame') {
		if (game.matchCount > game.positions) {
			showToast('匹配数不能超过物品数', { error: true });
			return;
		}
		fb = game.matchCount;
	} else {
		if (game.highlight + game.pale > game.positions) {
			showToast('亮点 + 苍白点 不能超过物品数', { error: true });
			return;
		}
		fb = [game.highlight, game.pale];
	}

	if (!game.currentGuess) return;
	const prevS = game.S;
	const newS = prevS.filter((s) => feedbackEquals(getFeedback(game.currentGuess!, s, game.mode, game.items), fb));

	if (newS.length === 0) {
		showToast('反馈矛盾 · 无可能解 · 请核对输入', { error: true, duration: 2600 });
		return;
	}

	game.history.push({ guess: game.currentGuess.slice(), feedback: fb, remainAfter: newS.length });
	game.S = newS;
	game.highlight = 0;
	game.pale = 0;
	game.matchCount = 0;

	if (game.S.length === 1) {
		finishGame(game.S[0].slice());
		return;
	}

	game.round++;
	game.computing = true;
	scrollHistoryToBottom();
	saveGame();

	try {
		const nextGuess = await computeNextGuess(buildComputeState());
		game.currentGuess = nextGuess;
		game.computing = false;
		scrollHistoryToBottom();
		saveGame();
	} catch (err) {
		game.computing = false;
		showToast('推演出错，请重试或重置对局', { error: true, duration: 3000 });
	}
}

// ==================== 自定义确认弹窗 ====================
export function openDialog(msg: string, onConfirm: () => void) {
	ui.dialog.msg = msg;
	ui.dialog.onConfirm = onConfirm;
	ui.dialog.show = true;
}

export function closeDialog() {
	ui.dialog.show = false;
	ui.dialog.onConfirm = null;
}

export function reset(opts: { silent?: boolean } = {}) {
	if (!opts.silent && game.running) {
		openDialog('确定要放弃当前对局并开始新的一局吗？', () => reset({ ...opts, silent: true }));
		return;
	}
	game.running = false;
	game.finished = false;
	game.history = [];
	game.S = [];
	game.currentGuess = null;
	game.revealedSecret = null;
	game.round = 0;
	game.highlight = 0;
	game.pale = 0;
	game.matchCount = 0;
	clearSavedGame();
	if (!opts.silent) showToast('已重置 · 可重新设置后开始新对局');
}

export function confirmClearSave() {
	openDialog('确定要清除本地存档吗？此操作不影响当前进行中的对局显示，仅清空刷新后可恢复的存档。', () => {
		clearSavedGame();
		showToast('已清除存档');
	});
}

// ==================== 分享 / 导出记录 ====================
export function buildTranscript(): string {
	const lines: string[] = [];
	lines.push('余烬炼金 · 推演记录');
	const modeLabel =
		game.mode === 'standard' ? '标准' : game.mode === 'sameitem' ? `相同物品(${game.sameItemPreset})` : '全同';
	lines.push(`配方模式：${modeLabel}${game.classicPreset ? '  经典配方：' + game.classicPreset : ''}`);
	lines.push(`物品数：${game.positions}  算法：${game.algorithm === 'minimax' ? '保守' : '激进'}`);
	lines.push('----------------------------------------');
	game.history.forEach((h, i) => {
		const names = h.guess.map((idx) => elementLabelFor(idx)).join('-');
		const fbText =
			typeof h.feedback === 'number'
				? `匹配 ${h.feedback}`
				: `亮点 ${h.feedback[0]} · 苍白 ${h.feedback[1]}`;
		lines.push(`第 ${i + 1} 回合  猜测：${names}   反馈：${fbText}   剩余解：${h.remainAfter}`);
	});
	lines.push('----------------------------------------');
	if (game.finished && game.revealedSecret) {
		lines.push(`共 ${game.history.length} 回合，真名：${game.revealedSecret.map((idx) => elementLabelFor(idx)).join('-')}`);
	} else {
		lines.push(`共 ${game.history.length} 回合，对局进行中（剩余可能 ${game.S.length} 解）`);
	}
	return lines.join('\n');
}

function copyTextToClipboard(text: string): Promise<void> {
	if (navigator.clipboard && navigator.clipboard.writeText) {
		return navigator.clipboard.writeText(text);
	}
	return new Promise((resolve, reject) => {
		try {
			const ta = document.createElement('textarea');
			ta.value = text;
			ta.style.position = 'fixed';
			ta.style.opacity = '0';
			ta.style.left = '-9999px';
			document.body.appendChild(ta);
			ta.focus();
			ta.select();
			const ok = document.execCommand('copy');
			document.body.removeChild(ta);
			if (ok) resolve();
			else reject(new Error('execCommand copy failed'));
		} catch (e) {
			reject(e);
		}
	});
}

export function exportTranscript() {
	const text = buildTranscript();
	copyTextToClipboard(text)
		.then(() => showToast('推演记录已复制到剪贴板'))
		.catch(() => showToast('复制失败 · 请手动截图保存', { error: true }));
}

// ==================== 初始化 ====================
export function initGame() {
	// 主题（initTheme）：先应用主题，savePrefs 随 applyTheme 触发，与源文件顺序一致
	const prefs0 = loadPrefs();
	let theme = prefs0.theme;
	if (theme !== 'light' && theme !== 'dark') {
		theme =
			window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}
	applyTheme(theme as 'light' | 'dark');

	const prefs = loadPrefs();
	if (prefs.algorithm) game.algorithm = prefs.algorithm as Algorithm;
	if (prefs.mode) game.mode = prefs.mode as Mode;
	if (prefs.sameItemPreset) game.sameItemPreset = prefs.sameItemPreset;

	const resumed = tryResumeGame();
	if (resumed) {
		scrollHistoryToBottom();
		showToast('已恢复上次未完成的对局进度');
	}
	return resumed;
}
