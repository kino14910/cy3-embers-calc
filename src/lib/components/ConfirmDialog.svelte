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
		<div class="dialog-rune">
			<img src="/textures/item_ember_dial.png" alt="" aria-hidden="true" />
		</div>
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
		background: rgba(5, 2, 1, 0.7);
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

	/* 铆接确认板：四角铆钉 + 黎明石描边 */
	.dialog {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 310;
		width: min(86vw, 340px);
		background-color: #150d07;
		background-image:
			radial-gradient(circle 4px at 16px 16px, #f0d08a 0%, #8a5f28 55%, transparent 60%),
			radial-gradient(circle 4px at calc(100% - 16px) 16px, #f0d08a 0%, #8a5f28 55%, transparent 60%),
			radial-gradient(circle 4px at 16px calc(100% - 16px), #f0d08a 0%, #8a5f28 55%, transparent 60%),
			radial-gradient(circle 4px at calc(100% - 16px) calc(100% - 16px), #f0d08a 0%, #8a5f28 55%, transparent 60%),
			linear-gradient(160deg, rgba(32, 19, 8, 0.9), rgba(18, 11, 5, 0.94)),
			url('/textures/block_archaic_bricks.png');
		background-repeat: no-repeat, no-repeat, no-repeat, no-repeat, repeat, repeat;
		background-size: auto, auto, auto, auto, auto, 48px 48px;
		image-rendering: pixelated;
		border: 2px solid #3a2412;
		outline: 1px solid rgba(242, 193, 78, 0.3);
		outline-offset: -6px;
		border-radius: 4px;
		box-shadow:
			0 12px 40px rgba(0, 0, 0, 0.7),
			0 0 30px rgba(255, 106, 31, 0.15);
		padding: 26px 20px 18px;
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
		line-height: 1;
	}
	.dialog-rune img {
		width: 30px;
		height: 30px;
		image-rendering: pixelated;
		filter: drop-shadow(0 0 8px rgba(255, 140, 40, 0.6));
	}
	.dialog-msg {
		color: var(--bone);
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
		border-radius: 3px;
		font-size: 13px;
		font-weight: 600;
		letter-spacing: 2px;
		transition: all 160ms ease;
	}
	.dialog-btn:active {
		transform: translateY(1px) scale(0.97);
	}
	.dialog-btn.cancel {
		background: linear-gradient(180deg, #26170b, #170d06);
		border: 1px solid rgba(201, 149, 68, 0.45);
		color: var(--dawnstone);
		box-shadow:
			inset 0 1px 0 rgba(255, 190, 110, 0.15),
			inset 0 -2px 0 rgba(0, 0, 0, 0.55);
	}
	.dialog-btn.confirm {
		background: linear-gradient(180deg, #ff8a30 0%, var(--ember) 45%, var(--ember-deep) 100%);
		border: 2px solid #31170a;
		color: #fff3d8;
		text-shadow: 0 1px 0 rgba(70, 20, 0, 0.65);
		box-shadow:
			inset 0 2px 0 rgba(255, 210, 130, 0.5),
			inset 0 -3px 0 rgba(110, 30, 0, 0.55),
			0 0 14px rgba(255, 106, 31, 0.4);
	}
</style>
