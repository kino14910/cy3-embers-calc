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
	.history-card {
		background: var(--history-bg);
		backdrop-filter: blur(var(--glass-blur));
		-webkit-backdrop-filter: blur(var(--glass-blur));
		border: 1px solid rgba(166, 124, 63, 0.4);
		border-radius: 10px;
		padding: 12px 14px;
		flex: 1;
		min-height: 180px;
		max-height: 50vh;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}
	.history-card::-webkit-scrollbar {
		width: 0;
		height: 0;
		display: none;
	}
	.history-title {
		font-size: 10px;
		color: var(--text-mute);
		letter-spacing: 2px;
		margin-bottom: 10px;
		font-weight: 700;
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
		border-bottom: 1px dotted rgba(166, 124, 63, 0.35);
	}
	.history-item:last-child {
		border-bottom: none;
	}
	.hist-top {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 6px;
		flex-wrap: wrap;
	}
	.history-num {
		color: var(--ember-red);
		font-weight: 700;
		font-size: 11px;
		min-width: 22px;
	}
	.hist-blocks {
		display: flex;
		gap: 4px;
		flex-wrap: wrap;
	}
	.hist-block {
		width: 34px;
		height: 26px;
		border-radius: 4px;
		border: 1px solid rgba(42, 24, 16, 0.5);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		box-shadow:
			inset 0 -2px 4px rgba(0, 0, 0, 0.25),
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
		color: var(--ember-orange);
		font-weight: 600;
		font-size: 11px;
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
	.hist-pending {
		background: rgba(210, 105, 30, 0.08);
		border-radius: 6px;
		padding: 10px 8px !important;
		margin: 4px -4px;
		border: 1px dashed var(--ember-orange);
	}
	.hist-pending-tag {
		color: var(--ember-red);
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 2px;
		animation: pulseTag 1.6s ease-in-out infinite;
	}
	@keyframes pulseTag {
		0%,
		100% {
			opacity: 0.6;
		}
		50% {
			opacity: 1;
		}
	}
	.hist-reveal {
		background: linear-gradient(135deg, rgba(201, 169, 97, 0.18), rgba(210, 105, 30, 0.1));
		border: 1px solid var(--gold) !important;
		border-radius: 6px;
		padding: 10px 8px !important;
		margin: 4px -4px;
	}
	.hist-reveal-tag {
		color: var(--ember-red);
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 2px;
	}
</style>
