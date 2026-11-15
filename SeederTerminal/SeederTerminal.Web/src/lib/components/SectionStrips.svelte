<script lang="ts">
  import { seederTelemetry } from '../stores/seederTelemetry'

  let { metric }: { metric: 'seedRate' | 'singulation' } = $props()

  let sections = $derived($seederTelemetry?.sections ?? [])
  let setpoint = $derived($seederTelemetry?.setpoint ?? 0)
  let isSeedRate = $derived(metric === 'seedRate')
</script>

<div class="section-list">
  <div class="section-grid" class:split={sections.length > 6} style:--column-rows={Math.ceil(sections.length / 2)}>
    {#each sections as sec (sec.index)}
      {@const rate = isSeedRate ? sec.seedRateActual : sec.singulationPercent}
      {@const fill = isSeedRate ? (setpoint > 0 ? Math.min(120, (rate / setpoint) * 100) : 0) : rate}
      <div class="section-row" class:seed-rate={isSeedRate}>
        <span class="index" class:on={sec.isOn}>{sec.index}</span>
        <div class="track" aria-hidden="true">
          <div class="fill" class:on={sec.isOn} style:width={`${fill}%`}></div>
        </div>
        <span class="reading">{isSeedRate ? Math.round(rate).toLocaleString() : rate.toFixed(1)}</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .section-list {
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior-y: contain;
    touch-action: pan-y;
  }
  .section-grid {
    display: grid;
    grid-auto-rows: 15px;
    overflow-y: clip;
  }
  :global(.portrait) .section-grid.split {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: repeat(var(--column-rows), 15px);
    grid-auto-flow: column;
    column-gap: 8px;
  }
  .section-row {
    display: grid;
    grid-template-columns: 2ch minmax(0, 1fr) minmax(4ch, max-content);
    align-items: center;
    gap: 4px;
    font-size: 12px;
    line-height: 14px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  .section-row.seed-rate {
    grid-template-columns: 2ch minmax(0, 1fr) minmax(7ch, max-content);
  }
  .index {
    color: #e06c6c;
  }
  .index.on {
    color: #4ade80;
  }
  .track {
    height: 7px;
    border-radius: 4px;
    background: rgba(25, 36, 50, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.08);
    overflow: hidden;
  }
  .fill {
    height: 100%;
    border-radius: inherit;
    background: rgba(180, 80, 80, 0.45);
    transition: width 0.2s, background 0.2s;
  }
  .fill.on {
    background: linear-gradient(90deg, #3d8fd4, #3ecf7a);
  }
  .reading {
    text-align: right;
  }
</style>
