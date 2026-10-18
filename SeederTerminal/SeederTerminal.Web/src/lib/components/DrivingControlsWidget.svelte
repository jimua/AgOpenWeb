<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { tick, sendCommand } from '../remote/session'

  let op = $derived($tick?.op)

  function toggleMaster() {
    sendCommand('section.master')
  }
  function toggleManual() {
    sendCommand('section.manual')
  }
  function toggleContour() {
    sendCommand('contour.toggle')
  }
</script>

<div class="widget">
  <div class="label">{$_('driving')}</div>
  <div class="grid">
    <button class:active={op?.contour} onclick={toggleContour}>
      {$_('contour')}
    </button>
    <button class:active={op?.sectionManual} onclick={toggleManual}>
      {$_('manual')}
    </button>
    <button
      class="master-btn"
      class:active={op?.sectionManual || op?.sectionAuto}
      onclick={toggleMaster}
    >
      {$_('master')}
    </button>
  </div>
</div>

<style>
  .widget {
    background: var(--panel);
    border: 1px solid var(--panel-border);
    border-radius: 12px;
    padding: 10px;
    min-width: 200px;
    backdrop-filter: blur(8px);
  }
  .label {
    font-size: 12px;
    color: var(--text-muted);
    font-weight: 600;
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .master-btn {
    grid-column: span 2;
  }
  button {
    min-height: 48px;
    border-radius: 10px;
    border: 1px solid var(--panel-border);
    background: #1c3048;
    color: var(--text);
    font-weight: 650;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, transform 0.1s;
  }
  button.active {
    background: #2a6aad;
    border-color: #6ba3d0;
  }
  button:active {
    transform: scale(0.98);
  }
</style>
