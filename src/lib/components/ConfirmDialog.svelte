<script lang="ts">
	import { closeDialog, ui } from '../state.svelte';

	function handleConfirm() {
		const fn = ui.dialog.onConfirm;
		closeDialog();
		fn?.();
	}

	function onKeydown(e: KeyboardEvent) {
		if (!ui.dialog.show) return;
		if (e.key === 'Escape') closeDialog();
		else if (e.key === 'Enter') handleConfirm();
	}
</script>

<svelte:window onkeydown={onKeydown} />

{#if ui.dialog.show}
	<div class="dialog-mask" onclick={closeDialog} role="presentation"></div>
	<div
		class="dialog"
		role="alertdialog"
		aria-modal="true"
		aria-label="确认操作"
		aria-describedby="dialog-msg"
	>
		<div class="dialog-rune">⚗</div>
		<div class="dialog-msg" id="dialog-msg">{ui.dialog.msg}</div>
		<div class="dialog-actions">
			<button class="dialog-btn cancel" type="button" onclick={closeDialog}>取 消</button>
			<button class="dialog-btn confirm" type="button" onclick={handleConfirm}>确 定</button>
		</div>
	</div>
{/if}

<style>
	.dialog-mask {
		position: fixed;
		inset: 0;
		background: rgba(26, 15, 8, 0.6);
		backdrop-filter: blur(2px);
		-webkit-backdrop-filter: blur(2px);
		z-index: 300;
		animation: maskIn 200ms ease;
	}
	@keyframes maskIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.dialog {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 310;
		width: min(86vw, 340px);
		background: linear-gradient(135deg, var(--wood-dark), var(--wood-mid));
		border: 1px solid var(--gold);
		border-radius: 10px;
		box-shadow: 0 12px 40px rgba(20, 10, 4, 0.6);
		padding: 24px 20px 18px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 14px;
		animation: dialogIn 240ms cubic-bezier(0.22, 1, 0.36, 1);
	}
	@keyframes dialogIn {
		from {
			opacity: 0;
			transform: translate(-50%, -46%) scale(0.94);
		}
		to {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1);
		}
	}

	.dialog-rune {
		font-size: 28px;
		color: var(--gold);
		opacity: 0.85;
		line-height: 1;
	}
	.dialog-msg {
		color: var(--cream);
		font-size: 14px;
		line-height: 1.7;
		text-align: center;
		letter-spacing: 1px;
	}

	.dialog-actions {
		display: flex;
		gap: 10px;
		width: 100%;
		margin-top: 4px;
	}
	.dialog-btn {
		flex: 1;
		padding: 10px 0;
		border-radius: 7px;
		font-size: 13px;
		font-weight: 600;
		letter-spacing: 2px;
		transition: all 180ms ease;
	}
	.dialog-btn:active {
		transform: scale(0.96);
	}
	.dialog-btn.cancel {
		background: transparent;
		border: 1px solid var(--gold);
		color: var(--gold);
	}
	.dialog-btn.confirm {
		background: linear-gradient(135deg, var(--ember-red), #a8431f);
		border: 1px solid var(--gold);
		color: var(--cream);
		box-shadow: 0 3px 10px rgba(139, 58, 31, 0.5);
	}
</style>
