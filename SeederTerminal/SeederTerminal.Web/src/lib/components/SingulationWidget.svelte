<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { seederTelemetry } from '../stores/seederTelemetry'
  import SectionStrips from './SectionStrips.svelte'
</script>

<div class="section-widget">
  <div class="section-summary">
    <div class="label">{$_('singulation')}</div>
    <div class="total">{$seederTelemetry ? `${$seederTelemetry.totalSingulation.toFixed(1)}%` : '—'}</div>
  </div>
  <SectionStrips metric="singulation" />
</div>

<style>
  .section-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
  }
  .label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
  }
  .total {
    font-size: 20px;
    font-weight: 700;
    line-height: 22px;
    font-variant-numeric: tabular-nums;
  }
</style>
