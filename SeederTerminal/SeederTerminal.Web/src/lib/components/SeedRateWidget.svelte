<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { seederTelemetry } from '../stores/seederTelemetry'
  import SectionStrips from './SectionStrips.svelte'

  let setpoint = $derived($seederTelemetry?.setpoint)
  let devPct = $derived(
    $seederTelemetry && $seederTelemetry.setpoint > 0
      ? (($seederTelemetry.actual - $seederTelemetry.setpoint) / $seederTelemetry.setpoint) * 100
      : 0,
  )
  let isAlert = $derived(Math.abs(devPct) > 10)
  let devSign = $derived(devPct > 0 ? '+' : '')
  let devText = $derived(`${devSign}${devPct.toFixed(1)}%`)
</script>

<div class="section-widget">
  <div class="section-summary">
    <div class="top-row">
      <div class="label">{$_('seedRate')}</div>
      {#if $seederTelemetry}
        <div class="dev-badge" class:alert={isAlert}>{devText}</div>
      {/if}
    </div>
    <div class="rates-row">
      <div>
        <div class="sub">{$_('actual')}</div>
        <div class="value">{$seederTelemetry ? Math.round($seederTelemetry.actual).toLocaleString() : '—'}</div>
      </div>
      <div>
        <div class="sub">{$_('setpoint')}</div>
        <div class="value dim">{setpoint === undefined ? '—' : Math.round(setpoint).toLocaleString()}</div>
      </div>
    </div>
  </div>
  <SectionStrips metric="seedRate" />
</div>

<style>
  .top-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    line-height: 14px;
  }
  .label {
    font-size: 12px;
    color: var(--text-muted);
    font-weight: 600;
    text-transform: uppercase;
  }
  .dev-badge {
    font-size: 12px;
    font-weight: 700;
    color: #4ade80;
    font-variant-numeric: tabular-nums;
  }
  .dev-badge.alert {
    color: #facc15;
    background: rgba(250, 204, 21, 0.15);
    padding: 0 4px;
    border-radius: 4px;
  }
  .rates-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 2px;
  }
  .sub {
    font-size: 11px;
    line-height: 12px;
    color: var(--text-muted);
  }
  .value {
    font-size: 16px;
    line-height: 18px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .dim {
    opacity: 0.75;
  }
</style>
