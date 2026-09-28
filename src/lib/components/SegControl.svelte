<script lang="ts">
	interface Props {
		options: { val: string; label: string }[];
		value: string;
		ariaLabel: string;
		locked?: boolean;
		onselect: (val: string) => void;
	}
	let { options, value, ariaLabel, locked = false, onselect }: Props = $props();

	let activeIdx = $derived(Math.max(0, options.findIndex((o) => o.val === value)));
	let sliderWidth = $derived(`calc(${100 / options.length}% - ${options.length === 2 ? 3 : 2}px)`);
</script>

<div class="seg-control" class:locked role="group" aria-label={ariaLabel}>
	{#each options as opt (opt.val)}
		<button
			class="seg-opt"
			class:active={opt.val === value}
			data-val={opt.val}
			type="button"
			disabled={locked}
			onclick={() => onselect(opt.val)}>{opt.label}</button
		>
	{/each}
	<div class="seg-slider" style:width={sliderWidth} style:transform={`translateX(${activeIdx * 100}%)`}></div>
</div>

<style>
	.seg-control {
		position: relative;
		display: flex;
		background: #1a0f08;
		border: 1px solid rgba(201, 169, 97, 0.4);
		border-radius: 8px;
		overflow: hidden;
		padding: 3px;
	}
	.seg-opt {
		flex: 1;
		position: relative;
		z-index: 2;
		background: transparent;
		border: none;
		padding: 8px 4px;
		color: rgba(244, 236, 216, 0.45);
		font-weight: 600;
		font-size: 12.5px;
		transition: color 240ms ease;
		letter-spacing: 0.5px;
		white-space: nowrap;
	}
	.seg-opt.active {
		color: var(--wood-dark);
	}
	.seg-opt:disabled {
		opacity: 0.5;
	}
	.seg-slider {
		position: absolute;
		top: 3px;
		bottom: 3px;
		left: 3px;
		background: linear-gradient(135deg, var(--gold) 0%, var(--brass) 100%);
		border-radius: 6px;
		transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1);
		z-index: 1;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
	}
	.seg-control.locked {
		opacity: 0.4;
		filter: grayscale(0.4);
	}
	@media (min-width: 768px) {
		.seg-opt {
			font-size: 14px;
			padding: 9px 8px;
		}
	}
</style>
