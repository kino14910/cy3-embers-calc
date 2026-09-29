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
		if (open) return;
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

<div class="settings-section" class:hidden={game.mode === 'sameitem'}>
	<div class="section-title">
		<span>常用配方</span>
		<button class="tiny-link-btn" type="button" onclick={clearClassicPreset}
			>清除配方</button
		>
	</div>

	<div
		class="combo"
		class:open
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
			onclick={toggleList}>▼</button
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
	/* ==================== 一体式可搜索下拉框（凹槽机件） ==================== */
	/* 外框：视觉上的唯一控件（背景/边框/圆角都在这里） */
	.combo {
		position: relative;
		display: flex;
		align-items: center;
		background: var(--socket);
		border: 1px solid rgba(201, 149, 68, 0.35);
		border-radius: 3px;
		box-shadow:
			inset 0 2px 5px rgba(0, 0, 0, 0.75),
			inset 0 -1px 0 rgba(255, 150, 60, 0.1);
		transition:
			border-color 200ms ease,
			box-shadow 200ms ease;
	}
	.combo:focus-within {
		border-color: var(--dawnstone);
		box-shadow:
			inset 0 2px 5px rgba(0, 0, 0, 0.75),
			0 0 12px rgba(242, 193, 78, 0.25);
	}
	/* 展开时：框底与列表贴合为一体 */
	.combo.open {
		border-color: var(--dawnstone);
		border-radius: 3px 3px 0 0;
	}

	/* 输入区：透明无边框，融入外框 */
	.combo-input {
		flex: 1;
		min-width: 0;
		background: transparent;
		border: none;
		color: var(--bone);
		padding: 9px 4px 9px 12px;
		font-size: 13px;
		font-weight: 600;
		font-family: inherit;
		letter-spacing: 1px;
	}
	.combo-input::placeholder {
		color: var(--ash-dim);
	}
	/* 焦点环由外框 focus-within 承担 */
	.combo-input:focus,
	.combo-input:focus-visible {
		outline: none;
	}

	/* 下拉箭头（内嵌于框内右侧） */
	.combo-arrow {
		background: none;
		border: none;
		color: var(--dawnstone);
		font-size: 11px;
		width: 32px;
		padding: 0;
		align-self: stretch;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: rotate 240ms ease;
		flex-shrink: 0;
		text-shadow: 0 0 6px rgba(242, 193, 78, 0.5);
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
		background: #120b05;
		border: 1px solid var(--dawnstone);
		border-top: 1px solid rgba(201, 149, 68, 0.3);
		border-radius: 0 0 3px 3px;
		list-style: none;
		z-index: 40;
		box-shadow:
			0 8px 20px rgba(0, 0, 0, 0.65),
			0 0 16px rgba(242, 193, 78, 0.15);
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
		color: var(--bone);
		cursor: pointer;
		border-bottom: 1px solid rgba(201, 149, 68, 0.14);
	}
	.combo-opt:last-child {
		border-bottom: none;
	}
	.combo-opt.active {
		background: rgba(255, 106, 31, 0.16);
	}
	.combo-opt.selected {
		background: rgba(201, 149, 68, 0.26);
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
		border-radius: 2px;
		image-rendering: pixelated;
		background: rgba(0, 0, 0, 0.4);
		border: 1px solid rgba(201, 149, 68, 0.3);
		padding: 1px;
		box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.6);
	}
	.opt-name {
		letter-spacing: 0.5px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.opt-meta {
		font-size: 10px;
		color: var(--ash-dim);
		white-space: nowrap;
		flex-shrink: 0;
	}
	.combo-empty {
		padding: 12px;
		font-size: 12px;
		color: var(--ash-dim);
		text-align: center;
	}

	.preset-active-tag {
		margin-top: 8px;
		font-size: 10.5px;
		color: var(--dawnstone);
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
		text-shadow: 0 0 6px rgba(242, 193, 78, 0.3);
	}
</style>
