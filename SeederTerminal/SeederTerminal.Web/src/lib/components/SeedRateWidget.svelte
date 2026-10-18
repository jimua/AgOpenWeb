<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { seedRateActual, seedRateSetpoint } from '../stores/seederSim'

  let devPct = $derived(
    $seedRateSetpoint > 0
      ? (($seedRateActual - $seedRateSetpoint) / $seedRateSetpoint) * 100
      : 0,
  )
  let isAlert = $derived(Math.abs(devPct) > 10)
  let devSign = $derived(devPct > 0 ? '+' : '')
  let devText = $derived(`${devSign}${devPct.toFixed(1)}%`)
  let pct = $derived(
    $seedRateSetpoint > 0 ? ($seedRateActual / $seedRateSetpoint) * 100 : 0,
  )
</script>

<div class="widget">
  <div class="header">
    <div class="label">{$_('seedRate')}</div>
    <div class="dev-badge" class:alert={isAlert}>
      {devText}
    </div>
  </div>
  <div class="row">
    <div>
      <div class="sub">{$_('actual')}</div>
      <div class="value">{Math.round($seedRateActual).toLocaleString()}</div>
    </div>
    <div>
      <div class="sub">{$_('setpoint')}</div>
      <div class="value dim">{Math.round($seedRateSetpoint).toLocaleString()}</div>
    </div>
  </div>
  <div class="bar">
    <div
      class="fill"
      class:alert={isAlert}
      style={`width:${Math.min(120, pct)}%`}
    ></div>
  </div>
</div>

<style>
  .widget {
    background: var(--panel);
    border: 1px solid var(--panel-border);
    border-radius: 12px;
    padding: 10px 14px;
    min-width: 200px;
    backdrop-filter: blur(8px);
  }
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .label {
    font-size: 12px;
    color: var(--text-muted);
    font-weight: 600;
    text-transform: uppercase;
  }
  .dev-badge {
    font-size: 14px;
    font-weight: 700;
    color: #4ade80;
    font-variant-numeric: tabular-nums;
  }
  .dev-badge.alert {
    color: #facc15;
    background: rgba(250, 204, 21, 0.15);
    padding: 2px 6px;
    border-radius: 4px;
  }
  .row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 4px;
  }
  .sub {
    font-size: 11px;
    color: var(--text-muted);
  }
  .value {
    font-size: 20px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .dim {
    opacity: 0.75;
  }
  .bar {
    margin-top: 8px;
    height: 8px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    overflow: hidden;
  }
  .fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), var(--ok));
    border-radius: 999px;
    transition: background 0.2s;
  }
  .fill.alert {
    background: linear-gradient(90deg, #e0a045, #e05555);
  }
</style>
