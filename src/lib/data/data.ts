export interface ElementDef {
	name: string;
	color: string;
}

export interface ClassicPreset {
	numItems: number;
	elements: string[];
	allSame: boolean;
}

export type Mode = 'standard' | 'sameitem' | 'allsame';
export type Algorithm = 'minimax' | 'entropy';
export type Feedback = number | [number, number];

export const ELEMENTS: ElementDef[] = [
	{ name: '铁', color: '#4A4A4A' },
	{ name: '铅', color: '#6B7B8C' },
	{ name: '银', color: '#C0C0C0' },
	{ name: '铜', color: '#B87333' },
	{ name: '黎明', color: '#F4D03F' },
	{ name: '天华', color: '#5DADE2' }
];

export const CLASSIC_PRESETS: Record<string, ClassicPreset> = {
	量子燃料: { numItems: 4, elements: ['铁', '铜', '铅', '银', '黎明'], allSame: true },
	滚沸天华桶: { numItems: 6, elements: ['黎明', '天华'], allSame: false },
	训练人偶: { numItems: 4, elements: ['铁', '铅', '铜', '银'], allSame: false },
	发条齿轮: { numItems: 4, elements: ['铜', '黎明'], allSame: true },
	灰烬布料: { numItems: 4, elements: ['铁', '铅', '铜'], allSame: false },
	诅咒星尘: { numItems: 2, elements: ['铅', '银'], allSame: false },
	万象模板: { numItems: 4, elements: ['铁', '铅', '铜', '银', '黎明'], allSame: false },
	胶黏剂: { numItems: 2, elements: ['铁', '铅'], allSame: false },
	圣洁象征符: { numItems: 2, elements: ['黎明', '天华'], allSame: false },
	太古动力核心: { numItems: 3, elements: ['铅', '黎明'], allSame: true },
	太古砖: { numItems: 3, elements: ['铁', '银'], allSame: false },
	蠕动鳞片: { numItems: 4, elements: ['铁', '铅', '银'], allSame: false },
	羊皮纸: { numItems: 4, elements: ['黎明', '银'], allSame: false },
	爆破核心: { numItems: 4, elements: ['铜', '铁'], allSame: false },
	天华聚晶: { numItems: 5, elements: ['铜', '银'], allSame: true },
	邪恶徽记: { numItems: 4, elements: ['黎明', '铅', '铁'], allSame: false },
	万用修复要素: { numItems: 3, elements: ['铜', '铁', '铅', '银'], allSame: false },
	亵渎象征符: { numItems: 2, elements: ['铁', '铅', '银', '铜'], allSame: false },
	咒龙之鳞: { numItems: 2, elements: ['铅', '银'], allSame: false },
	聚焦镜片: { numItems: 4, elements: ['银', '黎明'], allSame: false },
	无限余烬能量源: { numItems: 4, elements: ['黎明', '银', '铜', '铅'], allSame: false }
};

export const PRIORITY_PRESETS: string[] = [
	'灰烬布料',
	'蠕动鳞片',
	'无限余烬能量源',
	'胶黏剂',
	'万用修复要素',
	'量子燃料',
	'万象模板'
];

export const SAME_ITEM_PRESETS: Record<string, string[]> = {
	AA: ['A', 'A'],
	AAB: ['A', 'A', 'B'],
	AAA: ['A', 'A', 'A'],
	AABB: ['A', 'A', 'B', 'B'],
	AAAB: ['A', 'A', 'A', 'B'],
	AAAA: ['A', 'A', 'A', 'A']
};
