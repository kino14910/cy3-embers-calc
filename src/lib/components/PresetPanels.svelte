<script lang="ts">
	import { CLASSIC_PRESETS, PRIORITY_PRESETS } from '../data/data';
	import { applyClassicPreset, clearClassicPreset, game } from '../state.svelte';

	const allNames = Object.keys(CLASSIC_PRESETS);
	const orderedAll = [...PRIORITY_PRESETS, ...allNames.filter((n) => !PRIORITY_PRESETS.includes(n))];
	const prioritySet = new Set(PRIORITY_PRESETS);

	let activePreset = $derived(game.classicPreset ? CLASSIC_PRESETS[game.classicPreset] : null);
	// 绑定到原生 select 的选中值（Svelte 通过 property 同步 selected 状态）
	let selectValue = $derived(game.classicPreset ?? '');

	// 过滤框：隐藏的 option 原生 select 会自动跳过（不参与下拉与键盘导航）
	let query = $state('');
	let filtered = $derived(
		query.trim() ? orderedAll.filter((n) => n.toLowerCase().includes(query.trim().toLowerCase())) : orderedAll
	);
	let filteredSet = $derived(new Set(filtered));
	let matchCount = $derived(filtered.length);

	function metaFor(name: string): string {
		const p = CLASSIC_PRESETS[name];
		return `${p.numItems} 物品 · ${p.allSame ? '全同' : '标准'}`;
	}

	function onChange(e: Event) {
		const sel = e.currentTarget as HTMLSelectElement;
		const name = sel.value;
		if (name) applyClassicPreset(name);
		// 选中后取消焦点
		sel.blur();
	}
</script>

<div class="settings-section" class:hidden={game.mode === 'sameitem'} class:locked={game.running}>
	<div class="section-title">
		<span>常用配方</span>
		<button class="tiny-link-btn" type="button" disabled={game.running} onclick={clearClassicPreset}
			>清除配方 ✕</button
		>
	</div>

	<input
		class="filter-input"
		type="search"
		placeholder="搜索配方…"
		aria-label="搜索配方"
		disabled={game.running}
		bind:value={query}
	/>
	<div class="filter-meta" class:hidden={!query.trim()}>{matchCount} 项匹配</div>

	<select
		class="preset-select"
		aria-label="选择配方"
		disabled={game.running}
		bind:value={selectValue}
		onchange={onChange}
	>
		<button type="button">
			<selectedcontent></selectedcontent>
		</button>

		<option value="" disabled hidden class="placeholder-opt">— 请选择配方 —</option>
		{#each orderedAll as name (name)}
			<option value={name} hidden={!filteredSet.has(name)}>
				<span class="opt-name">{prioritySet.has(name) ? '★ ' : ''}{name}</span>
				<span class="opt-meta">{metaFor(name)}</span>
			</option>
		{/each}
	</select>
</div>

<style>
	/* 搜索框 */
	.filter-input {
		width: 100%;
		background: #1a0f08;
		border: 1px solid rgba(201, 169, 97, 0.4);
		border-radius: 8px;
		color: var(--cream);
		padding: 8px 12px;
		font-size: 13px;
		font-weight: 600;
		letter-spacing: 0.5px;
		margin-bottom: 6px;
		transition: border-color 200ms ease;
	}
	.filter-input::placeholder {
		color: rgba(244, 236, 216, 0.4);
	}
	.filter-input:focus-visible {
		border-color: var(--gold);
	}
	.filter-input:disabled {
		opacity: 0.5;
	}
	.filter-meta {
		font-size: 10px;
		color: rgba(244, 236, 216, 0.4);
		margin: -2px 0 6px 2px;
		letter-spacing: 0.5px;
	}

	/* ==================== 可定制 <select> ==================== */
	/* 让 select 与其下拉选择器都进入 base-select 模式（去除 OS 原生样式） */
	.preset-select,
	::picker(select) {
		appearance: base-select;
	}

	/* select 按钮（关闭态的框）：与 .filter-input 保持一致的框体样式 */
	.preset-select {
		width: 100%;
		background: #1a0f08;
		border: 1px solid rgba(201, 169, 97, 0.4);
		border-radius: 8px;
		color: var(--cream);
		padding: 8px 12px;
		font-size: 13px;
		font-weight: 600;
		font-family: inherit;
		letter-spacing: 0.5px;
		line-height: normal;
		transition: border-color 200ms ease;
		cursor: pointer;
		align-items: center;
	}
	.preset-select:hover,
	.preset-select:focus-visible {
		border-color: var(--gold);
	}
	.preset-select:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* 按钮内的 selectedcontent：占满宽度并两端对齐名称/副信息 */
	.preset-select selectedcontent {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		min-width: 0;
	}

	/* 下拉箭头图标 */
	.preset-select::picker-icon {
		color: var(--gold);
		font-size: 11px;
		transition: rotate 240ms ease;
	}
	.preset-select:open::picker-icon {
		rotate: 180deg;
	}

	/* 下拉选择器（popover，自动提升到顶层并锚定到按钮） */
	.preset-select::picker(select) {
		background: #221408;
		border: 1px solid var(--brass);
		border-radius: 8px;
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
		margin-top: 4px;
		max-height: 260px;
		overflow-y: auto;
		scrollbar-width: thin;
		scrollbar-color: var(--brass) transparent;
	}

	/* 选项 */
	.preset-select option {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		padding: 9px 12px;
		font-size: 12.5px;
		color: var(--cream);
		background: transparent;
		border-bottom: 1px solid rgba(201, 169, 97, 0.15);
	}
	.preset-select option:last-of-type {
		border-bottom: none;
	}
	.preset-select option:hover,
	.preset-select option:focus {
		background: rgba(201, 169, 97, 0.22);
	}
	/* 当前选中项 */
	.preset-select option:checked {
		background: rgba(201, 169, 97, 0.32);
		font-weight: 700;
	}
	/* 选中对勾 */
	.preset-select option::checkmark {
		color: var(--gold);
	}
	/* 占位项 */
	.preset-select option.placeholder-opt {
		color: rgba(244, 236, 216, 0.45);
	}

	/* 选项内名称 / 副信息（按钮内被克隆后也复用） */
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
</style>
