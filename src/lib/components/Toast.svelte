<script lang="ts">
	import { ui } from '../state.svelte';
</script>

<div class="toast" class:show={ui.toast.show} class:error={ui.toast.error} role="status" aria-live="polite">
	{ui.toast.msg}
</div>

<style>
	/* 余烬信号条：玄武岩板 + 顶部炽热线 */
	.toast {
		position: fixed;
		top: 20px;
		left: 50%;
		transform: translateX(-50%) translateY(-100px);
		background: linear-gradient(180deg, #1e1208, #120b05);
		border: 1px solid rgba(201, 149, 68, 0.5);
		border-top: 2px solid var(--ember);
		color: var(--bone);
		padding: 12px 22px;
		border-radius: 3px;
		font-size: 13px;
		font-weight: 500;
		z-index: 200;
		box-shadow:
			0 0 18px rgba(255, 106, 31, 0.2),
			0 6px 16px rgba(0, 0, 0, 0.55);
		opacity: 0;
		transition:
			transform 320ms cubic-bezier(0.22, 1, 0.36, 1),
			opacity 320ms ease;
		max-width: 80vw;
		text-align: center;
		letter-spacing: 1px;
	}
	.toast.show {
		transform: translateX(-50%) translateY(0);
		opacity: 1;
	}
	.toast.error {
		border-color: rgba(198, 62, 16, 0.7);
		border-top-color: #e03c10;
		background: linear-gradient(180deg, #2a0f06, #180803);
		box-shadow:
			0 0 18px rgba(224, 60, 16, 0.3),
			0 6px 16px rgba(0, 0, 0, 0.55);
	}
</style>
