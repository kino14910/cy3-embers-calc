import type { Algorithm, Mode } from '../data/data';
import { SAME_ITEM_PRESETS } from '../data/data';
import {
	OPTIMAL_FIRST_GUESS_ALLSAME_ENTROPY,
	OPTIMAL_FIRST_GUESS_ALLSAME_MINIMAX,
	OPTIMAL_FIRST_GUESS_SAMEITEM_ENTROPY,
	OPTIMAL_FIRST_GUESS_SAMEITEM_MINIMAX,
	OPTIMAL_FIRST_GUESS_STANDARD_ENTROPY,
	OPTIMAL_FIRST_GUESS_STANDARD_MINIMAX
} from './tables';

export function arraysEqual(a: unknown[] | null | undefined, b: unknown[] | null | undefined): boolean {
	if (!a || !b || a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
	return true;
}

export function feedbackEqual(a: unknown[], b: unknown[]): boolean {
	return arraysEqual(a, b);
}

export function entropyOf(counts: number[], total: number): number {
	let h = 0;
	for (let i = 0; i < counts.length; i++) {
		const p = counts[i] / total;
		if (p > 0) h -= p * Math.log2(p);
	}
	return h;
}

// 标准模式：位置严格绑定（经典 Mastermind 黑白珠）
export function getFeedbackStandard(guess: number[], secret: number[]): [number, number] {
	const n = guess.length;
	let black = 0,
		white = 0;
	const gUsed = new Array(n).fill(false);
	const sUsed = new Array(n).fill(false);
	for (let i = 0; i < n; i++) {
		if (guess[i] === secret[i]) {
			black++;
			gUsed[i] = true;
			sUsed[i] = true;
		}
	}
	for (let i = 0; i < n; i++) {
		if (gUsed[i]) continue;
		for (let j = 0; j < n; j++) {
			if (sUsed[j]) continue;
			if (guess[i] === secret[j]) {
				white++;
				sUsed[j] = true;
				break;
			}
		}
	}
	return [black, white];
}

// 相同物品模式：分组多重集匹配（组内多重集交集 = 亮点；跨组剩余元素多重集交集 = 苍白点）
export function getFeedbackGrouped(guess: number[], secret: number[], items: string[]): [number, number] {
	const groups = new Map<string, number[]>();
	items.forEach((item, idx) => {
		if (!groups.has(item)) groups.set(item, []);
		groups.get(item)!.push(idx);
	});

	const guessRemaining: Record<string, number> = {};
	const secretRemaining: Record<string, number> = {};
	for (let i = 0; i < guess.length; i++) {
		guessRemaining[guess[i]] = (guessRemaining[guess[i]] || 0) + 1;
		secretRemaining[secret[i]] = (secretRemaining[secret[i]] || 0) + 1;
	}

	let black = 0;
	groups.forEach((indices) => {
		const gCount: Record<string, number> = {},
			sCount: Record<string, number> = {};
		for (const idx of indices) {
			gCount[guess[idx]] = (gCount[guess[idx]] || 0) + 1;
			sCount[secret[idx]] = (sCount[secret[idx]] || 0) + 1;
		}
		const allElems = new Set(Object.keys(gCount).concat(Object.keys(sCount)));
		allElems.forEach((e) => {
			const matched = Math.min(gCount[e] || 0, sCount[e] || 0);
			black += matched;
			guessRemaining[e] -= matched;
			secretRemaining[e] -= matched;
		});
	});

	let white = 0;
	const allElems2 = new Set(Object.keys(guessRemaining).concat(Object.keys(secretRemaining)));
	allElems2.forEach((e) => {
		white += Math.min(guessRemaining[e] || 0, secretRemaining[e] || 0);
	});
	return [black, white];
}

// 全同模式：整体多重集交集计数
export function getFeedbackAllSame(guess: number[], secret: number[]): [number] {
	const g: Record<string, number> = {},
		s: Record<string, number> = {};
	for (let i = 0; i < guess.length; i++) g[guess[i]] = (g[guess[i]] || 0) + 1;
	for (let i = 0; i < secret.length; i++) s[secret[i]] = (s[secret[i]] || 0) + 1;
	let total = 0;
	for (const k in g) total += Math.min(g[k], s[k] || 0);
	return [total];
}

export function algoGetFeedback(mode: Mode, guess: number[], secret: number[], items?: string[]): number[] {
	if (mode === 'standard') return getFeedbackStandard(guess, secret);
	if (mode === 'sameitem') return getFeedbackGrouped(guess, secret, items || []);
	if (mode === 'allsame') return getFeedbackAllSame(guess, secret);
	throw new Error('algoGetFeedback: unknown mode "' + mode + '"');
}

// 标准模式：n 位 × colors，全笛卡尔积
export function algoGenerateAllCombos(n: number, colors: number[]): number[][] {
	const result: number[][] = [];
	function rec(arr: number[]) {
		if (arr.length === n) {
			result.push(arr.slice());
			return;
		}
		for (let ci = 0; ci < colors.length; ci++) {
			arr.push(colors[ci]);
			rec(arr);
			arr.pop();
		}
	}
	rec([]);
	return result;
}

// 组合数生成：从（已按数值升序排序的）colors 中取 size 个，允许重复，返回升序序列
function combsWithReplacement(sortedColors: number[], size: number): number[][] {
	const result: number[][] = [];
	const cur = new Array(size);
	function rec(startIdx: number, pos: number) {
		if (pos === size) {
			result.push(cur.slice());
			return;
		}
		for (let i = startIdx; i < sortedColors.length; i++) {
			cur[pos] = sortedColors[i];
			rec(i, pos + 1);
		}
	}
	rec(0, 0);
	return result;
}

// 相同物品模式：按 items 分组，组内只枚举「升序」赋值，跨组做笛卡尔积
export function generateFoldedSolutions(items: string[], colors: number[]): number[][] {
	const sortedColors = colors.slice().sort((a, b) => a - b);

	const groupOrder: string[] = [];
	const groupPositions: Record<string, number[]> = {};
	items.forEach((label, idx) => {
		if (!groupPositions[label]) {
			groupPositions[label] = [];
			groupOrder.push(label);
		}
		groupPositions[label].push(idx);
	});

	const perGroupChoices = groupOrder.map((label) =>
		combsWithReplacement(sortedColors, groupPositions[label].length)
	);

	const n = items.length;
	const solutions: number[][] = [];
	function rec(groupIdx: number, acc: number[]) {
		if (groupIdx === groupOrder.length) {
			solutions.push(acc.slice());
			return;
		}
		const label = groupOrder[groupIdx];
		const positions = groupPositions[label];
		const choices = perGroupChoices[groupIdx];
		for (let ci = 0; ci < choices.length; ci++) {
			const choice = choices[ci];
			for (let pi = 0; pi < positions.length; pi++) acc[positions[pi]] = choice[pi];
			rec(groupIdx + 1, acc);
		}
	}
	rec(0, new Array(n));
	return solutions;
}

// 全同模式解空间：n 个位置的整体多重集
export function generateAllSameSolutions(n: number, colors: number[]): number[][] {
	const items = new Array(n).fill('A');
	return generateFoldedSolutions(items, colors);
}

export function generateSolutionSpace(mode: Mode, params: { n: number; colors: number[]; items: string[] }): number[][] {
	const { n, colors, items } = params;
	if (mode === 'standard') return algoGenerateAllCombos(n, colors);
	if (mode === 'sameitem') return generateFoldedSolutions(items, colors);
	if (mode === 'allsame') return generateAllSameSolutions(n, colors);
	throw new Error('generateSolutionSpace: unknown mode "' + mode + '"');
}

const DEFAULT_THRESHOLD = 1000;
const DEFAULT_SAMPLE_CAP = 3000;

export function feedbackKey(_mode: Mode, fb: number[]): string {
	return fb.join(',');
}

export interface ChooseGuessCtx {
	mode: Mode;
	n: number;
	colors: number[];
	items?: string[];
	presetName?: string | null;
	S: number[][];
	candidatePool: number[][];
	history?: { guess: number[]; feedback: unknown }[];
	algorithm?: Algorithm;
	threshold?: number;
}

export interface ChooseGuessResult {
	guess: number[] | null;
	usedFallback: 'full' | 'S-restricted' | 'table' | 'forced' | 'none';
	stallDetected: boolean;
}

export function algoChooseGuess(ctx: ChooseGuessCtx): ChooseGuessResult {
	const mode = ctx.mode;
	const n = ctx.n;
	const colors = ctx.colors;
	const items = ctx.items || [];
	const presetName = ctx.presetName || null;
	const S = ctx.S;
	const candidatePool = ctx.candidatePool;
	const history = ctx.history || [];
	const algorithm = ctx.algorithm || 'minimax';
	const threshold = ctx.threshold || DEFAULT_THRESHOLD;

	if (!S || S.length === 0) return { guess: null, usedFallback: 'none', stallDetected: false };
	if (S.length === 1) return { guess: S[0], usedFallback: 'table', stallDetected: false };

	const isEntropy = algorithm === 'entropy';

	// ---- 首回合：查表 ----
	if (history.length === 0) {
		const k = colors.length;
		let tableGuessIdx: number[] | null = null;

		if (mode === 'standard') {
			const stdTable = isEntropy ? OPTIMAL_FIRST_GUESS_STANDARD_ENTROPY : OPTIMAL_FIRST_GUESS_STANDARD_MINIMAX;
			const stdKey = n + '_' + k;
			if (stdTable[stdKey]) tableGuessIdx = stdTable[stdKey];
		} else if (mode === 'sameitem') {
			const siTable = isEntropy ? OPTIMAL_FIRST_GUESS_SAMEITEM_ENTROPY : OPTIMAL_FIRST_GUESS_SAMEITEM_MINIMAX;
			const siKey = presetName + '_' + k;
			if (siTable[siKey]) tableGuessIdx = siTable[siKey];
		} else if (mode === 'allsame') {
			const asTable = isEntropy ? OPTIMAL_FIRST_GUESS_ALLSAME_ENTROPY : OPTIMAL_FIRST_GUESS_ALLSAME_MINIMAX;
			const asKey = n + '_' + k;
			if (asTable[asKey]) tableGuessIdx = asTable[asKey];
		}

		if (tableGuessIdx) {
			return { guess: tableGuessIdx.map((idx) => colors[idx]), usedFallback: 'table', stallDetected: false };
		}

		// 安全兜底（理论上不应触发）
		const usedCount = Math.min(k, Math.max(2, Math.ceil(n / 2)));
		const fallbackGuess: number[] = [];
		for (let i = 0; i < n; i++) {
			const ci2 = Math.min(Math.floor((i * usedCount) / n), usedCount - 1);
			fallbackGuess.push(colors[ci2]);
		}
		return { guess: fallbackGuess, usedFallback: 'forced', stallDetected: false };
	}

	if (S.length === 2) return { guess: S[0], usedFallback: 'table', stallDetected: false };

	// ---- 候选搜索空间：|S| > threshold 时仅在 S 内寻优（采样至 <= 3000） ----
	let candidates: number[][];
	let usedFallback: ChooseGuessResult['usedFallback'];
	if (S.length > threshold) {
		candidates = S;
		usedFallback = 'S-restricted';
		if (candidates.length > DEFAULT_SAMPLE_CAP) {
			const sampled: number[][] = [];
			const step = Math.floor(candidates.length / DEFAULT_SAMPLE_CAP);
			for (let si = 0; si < candidates.length; si += step) sampled.push(candidates[si]);
			candidates = sampled;
		}
	} else {
		candidates = candidatePool;
		usedFallback = 'full';
	}

	const isMinimax = !isEntropy;
	let bestGuess: number[] | null = null;
	let bestScore = isMinimax ? Infinity : -Infinity;
	const sKeys = new Set(S.map((s) => s.join(',')));

	// ---- 标准模式快速路径：flat typed-array 计分 ----
	if (mode === 'standard') {
		const nCand = candidates.length,
			nS = S.length;
		const flatCand = new Uint8Array(nCand * n);
		for (let fci = 0; fci < nCand; fci++) {
			const fg = candidates[fci],
				fbase = fci * n;
			for (let fp = 0; fp < n; fp++) flatCand[fbase + fp] = fg[fp];
		}
		const flatS = new Uint8Array(nS * n);
		const flatSCount = new Uint8Array(nS * 6);
		for (let fsi = 0; fsi < nS; fsi++) {
			const fs = S[fsi],
				fsbase = fsi * n,
				fscbase = fsi * 6;
			for (let fp2 = 0; fp2 < n; fp2++) {
				const fv = fs[fp2];
				flatS[fsbase + fp2] = fv;
				flatSCount[fscbase + fv]++;
			}
		}
		const gCount = new Uint8Array(6);
		const maxKey = (n + 1) * (n + 1);
		const partitionCounts = new Int32Array(maxKey);
		const touchedKeys = new Int32Array(maxKey);
		let bestGuessIdx = -1;

		for (let ci = 0; ci < nCand; ci++) {
			gCount.fill(0);
			const cbase = ci * n;
			for (let p1 = 0; p1 < n; p1++) gCount[flatCand[cbase + p1]]++;

			let numTouched = 0;
			for (let si2 = 0; si2 < nS; si2++) {
				const sbase = si2 * n;
				let black = 0;
				for (let p2 = 0; p2 < n; p2++) {
					if (flatCand[cbase + p2] === flatS[sbase + p2]) black++;
				}
				const scbase = si2 * 6;
				let white = 0;
				for (let c = 0; c < 6; c++) {
					const gv = gCount[c];
					if (gv) {
						const sv = flatSCount[scbase + c];
						white += gv < sv ? gv : sv;
					}
				}
				white -= black;
				const key = black * (n + 1) + white;
				if (partitionCounts[key] === 0) touchedKeys[numTouched++] = key;
				partitionCounts[key]++;
			}

			let score: number;
			if (isMinimax) {
				let maxSize = 0;
				for (let ti = 0; ti < numTouched; ti++) {
					const v = partitionCounts[touchedKeys[ti]];
					if (v > maxSize) maxSize = v;
				}
				const inS = sKeys.has(candidates[ci].join(',')) ? 0 : 0.5;
				score = maxSize + inS;
				if (score < bestScore) {
					bestScore = score;
					bestGuessIdx = ci;
				}
			} else {
				let entropy = 0;
				for (let ti2 = 0; ti2 < numTouched; ti2++) {
					const v2 = partitionCounts[touchedKeys[ti2]];
					const pr = v2 / nS;
					entropy -= pr * Math.log2(pr);
				}
				const inS2 = sKeys.has(candidates[ci].join(',')) ? 0.01 : 0;
				score = entropy + inS2;
				if (score > bestScore) {
					bestScore = score;
					bestGuessIdx = ci;
				}
			}

			for (let tr = 0; tr < numTouched; tr++) partitionCounts[touchedKeys[tr]] = 0;
		}
		bestGuess = bestGuessIdx >= 0 ? candidates[bestGuessIdx] : null;
	} else {
		// 通用路径（相同物品 / 全同模式）
		for (let gi = 0; gi < candidates.length; gi++) {
			const g = candidates[gi];
			const partitions = new Map<string, number>();
			for (let sj = 0; sj < S.length; sj++) {
				const f = algoGetFeedback(mode, g, S[sj], items);
				const key = feedbackKey(mode, f);
				partitions.set(key, (partitions.get(key) || 0) + 1);
			}

			let score2: number;
			if (isMinimax) {
				let maxSize2 = 0;
				partitions.forEach((size) => {
					if (size > maxSize2) maxSize2 = size;
				});
				const inS3 = sKeys.has(g.join(',')) ? 0 : 0.5;
				score2 = maxSize2 + inS3;
				if (score2 < bestScore) {
					bestScore = score2;
					bestGuess = g;
				}
			} else {
				let entropy2 = 0;
				const total2 = S.length;
				partitions.forEach((size) => {
					const p = size / total2;
					entropy2 -= p * Math.log2(p);
				});
				const inS4 = sKeys.has(g.join(',')) ? 0.01 : 0;
				score2 = entropy2 + inS4;
				if (score2 > bestScore) {
					bestScore = score2;
					bestGuess = g;
				}
			}
		}
	}

	// ---- 重复猜测安全网 ----
	let stallDetected = false;
	const lastRound = history[history.length - 1];
	if (lastRound && bestGuess && arraysEqual(bestGuess, lastRound.guess)) {
		stallDetected = true;
		let replacement: number[] | null = null;
		for (let ri = 0; ri < S.length; ri++) {
			if (!arraysEqual(S[ri], bestGuess)) {
				replacement = S[ri];
				break;
			}
		}
		bestGuess = replacement || S[0];
		usedFallback = 'forced';
	}

	return { guess: bestGuess, usedFallback, stallDetected };
}

// ==================== ADAPTER（UI 调用约定） ====================

export interface HistoryRound {
	guess: number[];
	feedback: number | number[];
	remainAfter?: number | null;
}

export interface UiComputeState {
	S: number[][];
	allCombos: number[][];
	mode: Mode;
	positions: number;
	itemLabels: string[];
	colors: number[];
	algorithm: Algorithm;
	history: HistoryRound[];
}

export function generateAllCombos(mode: Mode, positions: number, colorIndices: number[], itemLabels: string[]): number[][] {
	return generateSolutionSpace(mode, { n: positions, colors: colorIndices, items: itemLabels });
}

export function getFeedback(guess: number[], secret: number[], mode: Mode, itemLabels: string[]): number | number[] {
	const fb = algoGetFeedback(mode, guess, secret, itemLabels);
	if (mode === 'allsame') return fb[0];
	return fb;
}

export function chooseGuess(uiState: UiComputeState): number[] | null {
	let presetName: string | null = null;
	if (uiState.mode === 'sameitem') {
		const names = Object.keys(SAME_ITEM_PRESETS);
		for (let i = 0; i < names.length; i++) {
			if (arraysEqual(SAME_ITEM_PRESETS[names[i]], uiState.itemLabels)) {
				presetName = names[i];
				break;
			}
		}
	}
	const result = algoChooseGuess({
		mode: uiState.mode,
		n: uiState.positions,
		colors: uiState.colors,
		items: uiState.itemLabels,
		presetName,
		S: uiState.S,
		candidatePool: uiState.allCombos,
		history: uiState.history as ChooseGuessCtx['history'],
		algorithm: uiState.algorithm
	});
	if (result.stallDetected) {
		console.warn('[余烬炼金] duplicate-guess safety net triggered — this should be unreachable after the canonical-folding fix; see VERIFICATION_REPORT.md §6.');
	}
	return result.guess;
}
