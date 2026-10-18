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
    border: 1px solid rgba(73, 164, 161, 0.35);
    border-radius: 8px;
    padding: 8px;
    text-align: center;
    margin-bottom: 10px;
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
  .list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .row {
    display: grid;
    grid-template-columns: 28px 1fr 48px;
    gap: 8px;
    align-items: center;
    min-height: 28px;
    padding: 2px 4px;
    border-radius: 6px;
    font-size: 13px;
  }
  .row span {
    color: #e06c6c;
    font-weight: 700;
  }
  .row span.on {
    color: #4ade80;
  }
  .track {
    height: 16px;
    border-radius: 8px;
    background: rgba(25, 36, 50, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.08);
    overflow: hidden;
  }
  .fill {
    height: 100%;
    background: rgba(180, 80, 80, 0.45);
    border-radius: 8px;
    transition: width 0.2s, background 0.2s;
  }
  .fill.on {
    background: linear-gradient(90deg, #3d8fd4, #3ecf7a);
  }
  .pct {
    text-align: right;
    color: var(--text) !important;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
</style>
