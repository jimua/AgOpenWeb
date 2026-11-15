<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { tick, sendCommand } from '../remote/session'

  let { compact = false }: { compact?: boolean } = $props()

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

<div class="widget" class:compact>
  <div class="label">{$_('driving')}</div>
  <div class="buttons">
    <button
      type="button"
      title={$_(op?.contour ? 'contourOn' : 'contourOff')}
      aria-label={$_(op?.contour ? 'contourOn' : 'contourOff')}
      onclick={toggleContour}
    >
      <img src={`/icons/${op?.contour ? 'ContourOn' : 'ContourOff'}.png`} alt="" />
    </button>
    <button
      type="button"
      title={$_(op?.sectionManual ? 'manualOn' : 'manualOff')}
      aria-label={$_(op?.sectionManual ? 'manualOn' : 'manualOff')}
      onclick={toggleManual}
    >
      <img src={`/icons/${op?.sectionManual ? 'ManualOn' : 'ManualOff'}.png`} alt="" />
    </button>
    <button
      type="button"
      title={$_(op?.sectionAuto ? 'autoOn' : 'autoOff')}
      aria-label={$_(op?.sectionAuto ? 'autoOn' : 'autoOff')}
      onclick={toggleMaster}
    >
      <img src={`/icons/${op?.sectionAuto ? 'SectionMasterOn' : 'SectionMasterOff'}.png`} alt="" />
    </button>
  </div>
</div>

<style>
  .widget {
    width: max-content;
    padding: 8px;
    background: #cc121820;
    border-radius: 10px;
  }
  .label {
    margin-bottom: 6px;
    font-size: 12px;
    font-weight: 600;
    color: #dce5ee;
  }
  .buttons {
    display: flex;
    gap: 6px;
  }
  button {
    width: 56px;
    height: 56px;
    padding: 8px;
    border: 1px solid #4e739a;
    border-radius: 8px;
    background: #253a4e;
    cursor: pointer;
  }
  button:hover {
    background: #2f4d67;
  }
  button:active {
    background: #3a5d7a;
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .compact {
    padding: 4px 6px;
  }
  .compact .label {
    line-height: 14px;
    margin-bottom: 3px;
  }
  .compact .buttons {
    gap: 4px;
  }
  .compact button {
    width: 48px;
    height: 48px;
    padding: 6px;
  }
</style>
