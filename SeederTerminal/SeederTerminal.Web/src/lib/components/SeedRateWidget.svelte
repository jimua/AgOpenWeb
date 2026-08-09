<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { seedRateActual, seedRateSetpoint } from '../stores/seederSim'

  let pct = $derived(
    $seedRateSetpoint > 0 ? ($seedRateActual / $seedRateSetpoint) * 100 : 0,
  )
</script>

<div class="widget">
  <div class="label">{$_('seedRate')}</div>
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
    <div class="fill" style={`width:${Math.min(120, pct)}%`}></div>
  </div>
</div>

<style>
  .widget {
    background: var(--panel);
    border: 1px solid var(--panel-border);
    border-radius: 12px;
    padding: 10px 12px;
    min-width: 200px;
    backdrop-filter: blur(8px);
  }
  .label {
    font-size: 12px;
    color: var(--text-muted);
    font-weight: 600;
    text-transform: uppercase;
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
  }
</style>
