<script lang="ts">
	import { ui } from '../state.svelte';
</script>

<div class="toast" class:show={ui.toast.show} class:error={ui.toast.error} role="status" aria-live="polite">
	{ui.toast.msg}
</div>

<style>
	.toast {
		position: fixed;
		top: 20px;
		left: 50%;
		transform: translateX(-50%) translateY(-100px);
		background: linear-gradient(135deg, var(--wood-dark), var(--wood-mid));
		border: 1px solid var(--gold);
		color: var(--cream);
		padding: 12px 22px;
		border-radius: 8px;
		font-size: 13px;
		font-weight: 500;
		z-index: 200;
		box-shadow: 0 4px 12px var(--shadow);
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
		border-color: var(--ember-red);
		background: linear-gradient(135deg, #5c1c10, #3a1109);
	}
</style>
