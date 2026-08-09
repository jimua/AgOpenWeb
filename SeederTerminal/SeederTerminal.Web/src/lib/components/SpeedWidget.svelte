<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { speedKph, isMetric } from '../remote/session'

  let display = $derived(
    $isMetric ? $speedKph : $speedKph / 1.60934,
  )
  let unit = $derived($isMetric ? $_('kph') : $_('mph'))
</script>

<div class="widget">
  <div class="label">{$_('speed')}</div>
  <div class="value">{display.toFixed(1)}</div>
  <div class="unit">{unit}</div>
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
  .label {
    font-size: 12px;
    color: var(--text-muted);
    font-weight: 600;
    text-transform: uppercase;
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
</style>
