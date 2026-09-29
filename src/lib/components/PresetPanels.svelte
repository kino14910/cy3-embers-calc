<script lang="ts">
	import { tick } from 'svelte';
	import { CLASSIC_PRESETS, PRIORITY_PRESETS } from '../data/data';
	import { applyClassicPreset, clearClassicPreset, game } from '../state.svelte';

	const presetIcons = import.meta.glob('$lib/assets/presets/*.png', {
		eager: true,
		import: 'default'
	}) as Record<string, string>;

	// glob 的 key 是完整路径（如 /src/lib/assets/presets/量子燃料.png），按文件名建立映射
	const iconByKey: Record<string, string> = {};
	for (const [path, url] of Object.entries(presetIcons)) {
		const fileName = path.split('/').pop() ?? '';
		if (fileName.endsWith('.png')) iconByKey[fileName.slice(0, -4)] = url;
	}

	const allNames = Object.keys(CLASSIC_PRESETS);
	const orderedAll = [...PRIORITY_PRESETS, ...allNames.filter((n) => !PRIORITY_PRESETS.includes(n))];
	const prioritySet = new Set(PRIORITY_PRESETS);

	function iconFor(name: string): string | undefined {
		return iconByKey[name];
	}

	let activePreset = $derived(game.classicPreset ? CLASSIC_PRESETS[game.classicPreset] : null);

	let open = $state(false);
	let query = $state('');
	let activeIdx = $state(-1);
	let inputEl: HTMLInputElement | null = null;

	function attachInput(node: HTMLInputElement) {
		inputEl = node;
		return () => {
			inputEl = null;
		};
	}

	let filtered = $derived(
		query.trim() ? orderedAll.filter((n) => n.toLowerCase().includes(query.trim().toLowerCase())) : orderedAll
	);

	function metaFor(name: string): string {
		const p = CLASSIC_PRESETS[name];
		return `${p.numItems} 物品 · ${p.allSame ? '全同' : '标准'}`;
	}

	function scrollActiveIntoView() {
		tick().then(() => document.getElementById(`preset-opt-${activeIdx}`)?.scrollIntoView({ block: 'nearest' }));
	}

	function openList() {
		if (game.running || open) return;
		open = true;
		query = '';
		activeIdx = -1;
	}

	function closeList() {
		open = false;
		query = '';
		activeIdx = -1;
	}

	function toggleList() {
		if (game.running) return;
		if (open) {
			closeList();
		} else {
			openList();
			inputEl?.focus();
		}
	}

	function select(name: string) {
		applyClassicPreset(name);
		closeList();
		// 选中后取消焦点
		inputEl?.blur();
	}

	function onKeydown(e: KeyboardEvent) {
		if (game.running) return;
		if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
			e.preventDefault();
			openList();
			return;
		}
		if (!open) return;
		if (e.key === 'Escape') {
			e.preventDefault();
			closeList();
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (filtered.length) {
				activeIdx = (activeIdx + 1) % filtered.length;
				scrollActiveIntoView();
			}
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (filtered.length) {
				activeIdx = (activeIdx - 1 + filtered.length) % filtered.length;
				scrollActiveIntoView();
			}
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (activeIdx >= 0 && filtered[activeIdx]) select(filtered[activeIdx]);
			else if (filtered.length === 1) select(filtered[0]);
		} else if (e.key === 'Tab') {
			closeList();
		}
	}
</script>

<div class="settings-section" class:hidden={game.mode === 'sameitem'} class:locked={game.running}>
	<div class="section-title">
		<span>常用配方</span>
		<button class="tiny-link-btn" type="button" disabled={game.running} onclick={clearClassicPreset}
			>清除配方 ✕</button
		>
	</div>

	<div
		class="combo"
		class:open
		class:disabled={game.running}
		onfocusout={(e) => {
			if (!e.currentTarget.contains(e.relatedTarget as Node)) closeList();
		}}
	>
		<input
			class="combo-input"
			{@attach attachInput}
			type="text"
			role="combobox"
			aria-expanded={open}
			aria-controls="preset-listbox"
			aria-autocomplete="list"
			aria-activedescendant={activeIdx >= 0 ? `preset-opt-${activeIdx}` : undefined}
			placeholder={game.classicPreset ?? '搜索或选择配方…'}
			value={open ? query : (game.classicPreset ?? '')}
			readonly={!open}
			disabled={game.running}
			aria-label="搜索或选择配方"
			onfocus={openList}
			oninput={(e) => {
				query = e.currentTarget.value;
				activeIdx = -1;
			}}
			onkeydown={onKeydown}
		/>
		<button
			class="combo-arrow"
			type="button"
			tabindex="-1"
			aria-label={open ? '收起配方列表' : '展开配方列表'}
			disabled={game.running}
			onclick={toggleList}>▾</button
		>

		{#if open}
			<ul class="combo-list" id="preset-listbox" role="listbox" aria-label="配方列表">
				{#each filtered as name, i (name)}
					<li
						id={`preset-opt-${i}`}
						class="combo-opt"
						class:active={i === activeIdx}
						class:selected={game.classicPreset === name}
						role="option"
						aria-selected={game.classicPreset === name}
						onmouseenter={() => (activeIdx = i)}
						onmousedown={(e) => {
							e.preventDefault();
							select(name);
						}}
					>
						<span class="opt-main">
							{#if iconFor(name)}
								<img class="opt-icon" src={iconFor(name)} alt="" loading="lazy" />
							{/if}
							<span class="opt-name">{prioritySet.has(name) ? '★ ' : ''}{name}</span>
						</span>
						<span class="opt-meta">{metaFor(name)}</span>
					</li>
				{:else}
					<li class="combo-empty">无匹配配方</li>
				{/each}
			</ul>
		{/if}
	</div>

	<div class="preset-active-tag" class:hidden={!game.classicPreset}>
		{#if game.classicPreset && activePreset}
			当前配方：{game.classicPreset}（{activePreset.numItems} 物品 · {activePreset.allSame ? '全同模式' : '标准模式'}）
		{/if}
	</div>
</div>

<style>
	/* ==================== 一体式可搜索下拉框 ==================== */
	/* 外框：视觉上的唯一控件（背景/边框/圆角都在这里） */
	.combo {
		position: relative;
		display: flex;
		align-items: center;
		background: #1a0f08;
		border: 1px solid rgba(201, 169, 97, 0.4);
		border-radius: 8px;
		transition: border-color 200ms ease;
	}
	.combo:focus-within {
		border-color: var(--gold);
	}
	/* 展开时：框底与列表贴合为一体 */
	.combo.open {
		border-color: var(--gold);
		border-radius: 8px 8px 0 0;
	}
	.combo.disabled {
		opacity: 0.5;
	}

	/* 输入区：透明无边框，融入外框 */
	.combo-input {
		flex: 1;
		min-width: 0;
		background: transparent;
		border: none;
		color: var(--cream);
		padding: 8px 4px 8px 12px;
		font-size: 13px;
		font-weight: 600;
		font-family: inherit;
		letter-spacing: 0.5px;
	}
	.combo-input::placeholder {
		color: rgba(244, 236, 216, 0.4);
	}
	/* 焦点环由外框 focus-within 承担 */
	.combo-input:focus,
	.combo-input:focus-visible {
		outline: none;
	}
	.combo-input:disabled {
		cursor: not-allowed;
	}

	/* 下拉箭头（内嵌于框内右侧） */
	.combo-arrow {
		background: none;
		border: none;
		color: var(--gold);
		font-size: 11px;
		padding: 8px 12px 8px 6px;
		transition: rotate 240ms ease;
		flex-shrink: 0;
	}
	.combo-arrow:focus,
	.combo-arrow:focus-visible {
		outline: none;
	}
	.combo.open .combo-arrow {
		rotate: 180deg;
	}

	/* 下拉列表：与外框下沿无缝贴合 */
	.combo-list {
		position: absolute;
		top: 100%;
		left: -1px;
		right: -1px;
		max-height: 240px;
		overflow-y: auto;
		background: #1a0f08;
		border: 1px solid var(--gold);
		border-top: 1px solid rgba(201, 169, 97, 0.3);
		border-radius: 0 0 8px 8px;
		list-style: none;
		z-index: 40;
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
		scrollbar-width: thin;
		scrollbar-color: var(--brass) transparent;
	}
	.combo-opt {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		padding: 8px 12px;
		font-size: 12.5px;
		color: var(--cream);
		cursor: pointer;
		border-bottom: 1px solid rgba(201, 169, 97, 0.15);
	}
	.combo-opt:last-child {
		border-bottom: none;
	}
	.combo-opt.active {
		background: rgba(201, 169, 97, 0.22);
	}
	.combo-opt.selected {
		background: rgba(201, 169, 97, 0.32);
		font-weight: 700;
	}
	.opt-main {
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 0;
		flex: 1;
	}
	.opt-icon {
		width: 22px;
		height: 22px;
		flex-shrink: 0;
		object-fit: contain;
		border-radius: 3px;
		image-rendering: pixelated;
		background: rgba(0, 0, 0, 0.25);
		border: 1px solid rgba(201, 169, 97, 0.25);
		padding: 1px;
	}
	.opt-name {
		letter-spacing: 0.5px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.opt-meta {
		font-size: 10px;
		color: rgba(244, 236, 216, 0.45);
		white-space: nowrap;
		flex-shrink: 0;
	}
	.combo-empty {
		padding: 12px;
		font-size: 12px;
		color: rgba(244, 236, 216, 0.4);
		text-align: center;
	}

	.preset-active-tag {
		margin-top: 8px;
		font-size: 10.5px;
		color: var(--gold);
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}
</style>
