<script lang="ts">
	import { ELEMENTS } from '../data/data';
	import { elementLabelFor, game, getContrastColor, lighten, registerHistoryCard } from '../state.svelte';

	let showItem = $derived(game.mode !== 'standard');
	let visible = $derived(game.history.length > 0 || !!game.currentGuess);

	function blockStyle(idx: number): string {
		const color = ELEMENTS[idx].color;
		return `background:linear-gradient(135deg, ${lighten(color, 40)}, ${color});`;
	}

	function attachCard(node: HTMLDivElement) {
		registerHistoryCard(node);
		node.scrollTop = node.scrollHeight;
		return () => registerHistoryCard(null);
	}
</script>

{#if visible}
	<div class="history-card" {@attach attachCard}>
		<div class="history-title">推 演 史 · HISTORY</div>
		<div class="history-list">
			{#each game.history as h, i (i)}
				<div class="history-item">
					<div class="hist-top">
						<span class="history-num">#{i + 1}</span>
						<div class="hist-blocks">
							{#each h.guess as idx, pos (pos)}
								{@const color = ELEMENTS[idx].color}
								<div class="hist-block" style={blockStyle(idx)}>
									<span class="hist-block-name" style="color:{getContrastColor(color)}"
										>{elementLabelFor(idx)}</span
									>
									{#if showItem}
										<span class="hist-block-item" style="color:{getContrastColor(color)}"
											>{game.items[pos]}</span
										>
									{/if}
								</div>
							{/each}
						</div>
					</div>
					<div class="hist-bottom">
						<span class="hist-fb-line">
							{#if typeof h.feedback === 'number'}
								<span class="hist-fb-hl">匹配 {h.feedback}</span>
							{:else}
								<span class="hist-fb-hl">亮点 {h.feedback[0]}</span><span class="hist-fb-pl"
									>苍白 {h.feedback[1]}</span
								>
							{/if}
						</span>
						{#if h.remainAfter != null}
							<span class="hist-remain">剩余 {h.remainAfter} 解</span>
						{/if}
					</div>
				</div>
			{/each}

			{#if game.finished && game.revealedSecret}
				<div class="history-item hist-reveal">
					<div class="hist-top">
						<span class="history-num">✓</span>
						<div class="hist-blocks">
							{#each game.revealedSecret as idx, pos (pos)}
								{@const color = ELEMENTS[idx].color}
								<div class="hist-block" style={blockStyle(idx)}>
									<span class="hist-block-name" style="color:{getContrastColor(color)}"
										>{elementLabelFor(idx)}</span
									>
									{#if showItem}
										<span class="hist-block-item" style="color:{getContrastColor(color)}"
											>{game.items[pos]}</span
										>
									{/if}
								</div>
							{/each}
						</div>
					</div>
					<div class="hist-bottom"><span class="hist-reveal-tag">真名揭晓</span></div>
				</div>
			{:else if game.currentGuess && !game.finished}
				<div class="history-item hist-pending">
					<div class="hist-top">
						<span class="history-num">#{game.round}</span>
						<div class="hist-blocks">
							{#each game.currentGuess as idx, pos (pos)}
								{@const color = ELEMENTS[idx].color}
								<div class="hist-block" style={blockStyle(idx)}>
									<span class="hist-block-name" style="color:{getContrastColor(color)}"
										>{elementLabelFor(idx)}</span
									>
									{#if showItem}
										<span class="hist-block-item" style="color:{getContrastColor(color)}"
											>{game.items[pos]}</span
										>
									{/if}
								</div>
							{/each}
						</div>
					</div>
					<div class="hist-bottom"><span class="hist-pending-tag">等待反馈</span></div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	/* 推演史：玄武岩日志板 */
	.history-card {
		background: var(--history-bg);
		backdrop-filter: blur(var(--glass-blur));
		-webkit-backdrop-filter: blur(var(--glass-blur));
		border: 2px solid var(--card-border);
		border-radius: 4px;
		padding: 12px 14px;
		flex: 1;
		min-height: 180px;
		max-height: 50vh;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		box-shadow:
			inset 0 1px 0 var(--card-hi),
			0 4px 14px var(--shadow);
		scrollbar-width: none;
		-ms-overflow-style: none;
	}
	.history-card::-webkit-scrollbar {
		width: 0;
		height: 0;
		display: none;
	}
	.history-title {
		font-family: 'ZCOOL QingKe HuangYou', 'PingFang SC', 'Microsoft YaHei', sans-serif;
		font-size: 11px;
		color: var(--text-mute);
		letter-spacing: 4px;
		margin-bottom: 10px;
		text-transform: uppercase;
		flex-shrink: 0;
	}
	.history-list {
		flex: 1;
		overflow-y: auto;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}
	.history-list::-webkit-scrollbar {
		width: 0;
		height: 0;
		display: none;
	}
	.history-item {
		padding: 10px 0;
		font-size: 12px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.45);
		box-shadow: inset 0 -1px 0 rgba(255, 170, 80, 0.05);
	}
	:global([data-theme='light']) .history-item {
		border-bottom-color: rgba(90, 60, 20, 0.25);
	}
	.history-item:last-child {
		border-bottom: none;
		box-shadow: none;
	}
	.hist-top {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 6px;
		flex-wrap: wrap;
	}
	.history-num {
		color: var(--dawnstone);
		font-family: 'Press Start 2P', 'Courier New', monospace;
		font-size: 9px;
		min-width: 24px;
		text-shadow: 0 0 6px rgba(242, 193, 78, 0.4);
	}
	.hist-blocks {
		display: flex;
		gap: 4px;
		flex-wrap: wrap;
	}
	/* 历史元素块：像素砖 */
	.hist-block {
		width: 34px;
		height: 26px;
		border-radius: 2px;
		border: 1px solid rgba(0, 0, 0, 0.6);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.25),
			inset 0 -2px 0 rgba(0, 0, 0, 0.35),
			0 1px 2px var(--shadow);
		gap: 1px;
	}
	.hist-block-name {
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 1px;
		text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
	}
	.hist-block-item {
		font-size: 8px;
		font-weight: 400;
		opacity: 0.75;
		letter-spacing: 0;
	}
	.hist-bottom {
		display: flex;
		align-items: center;
		gap: 12px;
		padding-left: 30px;
		flex-wrap: wrap;
	}
	.hist-fb-line {
		display: flex;
		gap: 10px;
	}
	.hist-fb-hl {
		color: var(--num-hot);
		font-weight: 600;
		font-size: 11px;
		text-shadow: 0 0 6px rgba(255, 140, 40, 0.35);
	}
	.hist-fb-pl {
		color: var(--text-mute);
		font-weight: 600;
		font-size: 11px;
	}
	.hist-remain {
		color: var(--brass);
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 1px;
		margin-left: auto;
	}
	/* 等待反馈：余烬虚线槽 */
	.hist-pending {
		background: rgba(255, 106, 31, 0.07);
		border-radius: 3px;
		padding: 10px 8px !important;
		margin: 4px -4px;
		border: 1px dashed rgba(255, 106, 31, 0.65);
		box-shadow: inset 0 0 14px rgba(255, 106, 31, 0.1);
	}
	.hist-pending-tag {
		color: var(--num-hot);
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 2px;
		animation: pulseTag 1.6s steps(3) infinite;
	}
	@keyframes pulseTag {
		0%,
		100% {
			opacity: 0.55;
		}
		50% {
			opacity: 1;
		}
	}
	/* 真名揭晓：黎明石镶板 */
	.hist-reveal {
		background: linear-gradient(135deg, rgba(242, 193, 78, 0.16), rgba(255, 106, 31, 0.1));
		border: 1px solid var(--dawnstone) !important;
		border-radius: 3px;
		padding: 10px 8px !important;
		margin: 4px -4px;
		box-shadow:
			0 0 14px rgba(242, 193, 78, 0.25),
			inset 0 0 10px rgba(242, 193, 78, 0.12);
	}
	.hist-reveal-tag {
		color: var(--dawnstone);
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 2px;
		text-shadow: 0 0 8px rgba(242, 193, 78, 0.5);
	}
</style>
