<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { seedRateActual, seedRateSetpoint, simulatedSections } from '../stores/seederSim'

  let devPct = $derived(
    $seedRateSetpoint > 0
      ? (($seedRateActual - $seedRateSetpoint) / $seedRateSetpoint) * 100
      : 0,
  )
  let isAlert = $derived(Math.abs(devPct) > 10)
  let devSign = $derived(devPct > 0 ? '+' : '')
  let devText = $derived(`${devSign}${devPct.toFixed(1)}%`)
</script>

<div class="widget">
  <div class="header">
    <div class="top-row">
      <div class="label">{$_('seedRate')}</div>
      <div class="dev-badge" class:alert={isAlert}>
        {devText}
      </div>
    </div>
    <div class="rates-row">
      <div>
        <div class="sub">{$_('actual')}</div>
        <div class="value">{Math.round($seedRateActual).toLocaleString()}</div>
      </div>
      <div>
        <div class="sub">{$_('setpoint')}</div>
        <div class="value dim">{Math.round($seedRateSetpoint).toLocaleString()}</div>
      </div>
    </div>
  </div>
  <div class="list">
    {#each $simulatedSections as sec (sec.index)}
      {@const pct = $seedRateSetpoint > 0 ? Math.min(120, (sec.seedRateActual / $seedRateSetpoint) * 100) : 0}
      <div class="row">
        <span class:on={sec.isOn}>{sec.index}</span>
        <div class="track">
          <div
            class="fill"
            class:on={sec.isOn}
            style={`width:${pct}%`}
          ></div>
        </div>
        <span class="rate">{Math.round(sec.seedRateActual).toLocaleString()}</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .widget {
    background: var(--panel);
    border: 1px solid var(--panel-border);
    border-radius: 12px;
    padding: 10px 14px;
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
    margin-bottom: 10px;
  }
  .top-row {
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
  .rates-row {
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
    font-size: 18px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .dim {
    opacity: 0.75;
  }
  .list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .row {
    display: grid;
    grid-template-columns: 28px 1fr 64px;
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
  .rate {
    text-align: right;
    color: var(--text) !important;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    font-size: 12px;
  }
</style>
