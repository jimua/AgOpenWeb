<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { speedKph, statusBar } from '../remote/session'

  let { compact = false }: { compact?: boolean } = $props()

  let gpsOk = $derived(!!$statusBar?.gpsOk)
  let fixText = $derived($statusBar?.fixText || (gpsOk ? 'GPS OK' : 'NO GPS'))
</script>

<div class="widget" class:compact>
  <div class="top-row">
    <div class="label">{$_('speed')}</div>
    <div class="gnss" class:ok={gpsOk} title={fixText}>
      <span class="dot"></span>
      <span class="gnss-label">GNSS</span>
    </div>
  </div>
  <div class="value">{$speedKph.toFixed(1)}</div>
  <div class="unit">{$_('kph')}</div>
</div>

<style>
  .widget {
    background: var(--panel);
    border: 1px solid var(--panel-border);
    border-radius: 12px;
    padding: 10px 14px;
    min-width: 140px;
    text-align: center;
    backdrop-filter: blur(8px);
  }
  .top-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2px;
  }
  .label {
    font-size: 12px;
    color: var(--text-muted);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .gnss {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px;
    border-radius: 999px;
    background: rgba(224, 85, 85, 0.2);
    border: 1px solid rgba(224, 85, 85, 0.4);
    font-size: 10px;
    font-weight: 700;
    color: #ff9494;
  }
  .gnss.ok {
    background: rgba(62, 207, 122, 0.2);
    border-color: rgba(62, 207, 122, 0.5);
    color: #4ade80;
  }
  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
  .gnss-label {
    letter-spacing: 0.04em;
  }
  .value {
    font-size: 40px;
    font-weight: 700;
    line-height: 1.1;
    font-variant-numeric: tabular-nums;
  }
  .unit {
    font-size: 12px;
    color: var(--text-muted);
  }
  .compact {
    display: grid;
    align-content: center;
    min-width: 0;
    padding: 4px 6px;
  }
  .compact .top-row {
    flex-wrap: wrap;
    gap: 0 4px;
  }
  .compact .label {
    font-size: 11px;
  }
  .compact .gnss {
    padding: 0 4px;
  }
  .compact .value {
    font-size: 26px;
  }
  .compact .unit {
    line-height: 14px;
  }
</style>
