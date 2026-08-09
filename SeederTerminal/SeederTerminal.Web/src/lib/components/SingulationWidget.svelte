<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { simulatedSections, totalSingulation } from '../stores/seederSim'
</script>

<div class="widget">
  <div class="header">
    <div class="label">{$_('singulation')}</div>
    <div class="total">{$totalSingulation.toFixed(1)}%</div>
  </div>
  <div class="list">
    {#each $simulatedSections as sec (sec.index)}
      <div class="row">
        <span class:on={sec.isOn}>{sec.index}</span>
        <div class="track">
          <div
            class="fill"
            class:on={sec.isOn}
            style={`width:${sec.singulationPercent}%`}
          ></div>
        </div>
        <span class="pct">{sec.singulationPercent.toFixed(1)}</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .widget {
    background: var(--panel);
    border: 1px solid var(--panel-border);
    border-radius: 12px;
    padding: 10px;
    min-width: 220px;
    max-height: 42vh;
    overflow: auto;
    backdrop-filter: blur(8px);
  }
  .header {
    background: rgba(73, 164, 161, 0.2);
    border-radius: 8px;
    padding: 8px;
    text-align: center;
    margin-bottom: 8px;
  }
  .label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
  }
  .total {
    font-size: 34px;
    font-weight: 700;
    line-height: 1.1;
  }
  .row {
    display: grid;
    grid-template-columns: 28px 1fr 44px;
    gap: 6px;
    align-items: center;
    margin-bottom: 4px;
    font-size: 13px;
  }
  .row span {
    color: #d37676;
    font-weight: 600;
  }
  .row span.on {
    color: #66d38d;
  }
  .track {
    height: 14px;
    border-radius: 8px;
    background: rgba(48, 63, 79, 0.55);
    overflow: hidden;
  }
  .fill {
    height: 100%;
    background: rgba(91, 74, 74, 0.5);
    border-radius: 8px;
  }
  .fill.on {
    background: #59c87a;
  }
  .pct {
    text-align: right;
    color: var(--text) !important;
    font-variant-numeric: tabular-nums;
  }
</style>
