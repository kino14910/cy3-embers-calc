<script lang="ts">
	interface Props {
		options: { val: string; label: string }[];
		value: string;
		ariaLabel: string;
		onselect: (val: string) => void;
	}
	let { options, value, ariaLabel, onselect }: Props = $props();

	let activeIdx = $derived(Math.max(0, options.findIndex((o) => o.val === value)));
	let sliderWidth = $derived(`calc(${100 / options.length}% - ${options.length === 2 ? 3 : 2}px)`);
</script>

<div class="seg-control" role="group" aria-label={ariaLabel}>
	{#each options as opt (opt.val)}
		<button
			class="seg-opt"
			class:active={opt.val === value}
			data-val={opt.val}
			type="button"
			onclick={() => onselect(opt.val)}>{opt.label}</button
		>
	{/each}
	<div class="seg-slider" style:width={sliderWidth} style:transform={`translateX(${activeIdx * 100}%)`}></div>
</div>

<style>
	/* 机械拨杆：凹槽轨道 + 滑动黄铜闸块 */
	.seg-control {
		position: relative;
		display: flex;
		background: var(--socket);
		border: 1px solid #000;
		border-radius: 3px;
		overflow: hidden;
		padding: 3px;
		box-shadow:
			inset 0 2px 5px rgba(0, 0, 0, 0.8),
			inset 0 -1px 0 rgba(255, 150, 60, 0.1),
			0 1px 0 rgba(255, 170, 80, 0.06);
	}
	.seg-opt {
		flex: 1;
		position: relative;
		z-index: 2;
		background: transparent;
		border: none;
		padding: 8px 4px;
		color: var(--ash-dim);
		font-weight: 600;
		font-size: 12.5px;
		transition: color 240ms ease;
		letter-spacing: 1px;
		white-space: nowrap;
	}
	.seg-opt.active {
		color: #2a1708;
		text-shadow: 0 1px 0 rgba(255, 240, 200, 0.45);
	}
	.seg-slider {
		position: absolute;
		top: 3px;
		bottom: 3px;
		left: 3px;
		background: linear-gradient(180deg, #ffd97a 0%, var(--dawnstone) 45%, #c98f2e 100%);
		border: 1px solid #5a3a12;
		border-radius: 2px;
		transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1);
		z-index: 1;
		box-shadow:
			inset 0 1px 0 rgba(255, 245, 210, 0.75),
			inset 0 -2px 0 rgba(120, 70, 10, 0.6),
			0 0 10px rgba(242, 193, 78, 0.4);
	}
	@media (min-width: 768px) {
		.seg-opt {
			font-size: 14px;
			padding: 9px 8px;
		}
	}
</style>
