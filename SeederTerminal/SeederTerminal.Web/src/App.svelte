<script lang="ts">
  import { onMount } from 'svelte'
  import { isLoading, _ } from 'svelte-i18n'
  import './lib/i18n'
  import { setLanguage } from './lib/i18n'
  import { startRemote, stopRemote, connState, currentPage } from './lib/remote/session'
  import MapCanvas from './lib/components/MapCanvas.svelte'
  import Drawer from './lib/components/Drawer.svelte'
  import ProgramPage from './lib/pages/ProgramPage.svelte'
  import VehiclePage from './lib/pages/VehiclePage.svelte'
  import FieldPage from './lib/pages/FieldPage.svelte'
  import SpeedWidget from './lib/components/SpeedWidget.svelte'
  import SeedRateWidget from './lib/components/SeedRateWidget.svelte'
  import SingulationWidget from './lib/components/SingulationWidget.svelte'
  import DrivingControlsWidget from './lib/components/DrivingControlsWidget.svelte'
  import CameraControls from './lib/components/CameraControls.svelte'
  import { renderFps } from './lib/stores/fps'

  let landscape = $state(true)

  function updateLayout() {
    landscape = window.innerWidth >= window.innerHeight
  }

  onMount(() => {
    updateLayout()
    window.addEventListener('resize', updateLayout)
    startRemote()
    return () => {
      window.removeEventListener('resize', updateLayout)
      stopRemote()
    }
  })

  let connLabel = $derived(
    $connState === 'connected'
      ? $_('connected')
      : $connState.startsWith('connect')
        ? $_('connecting')
        : $_('disconnected'),
  )
</script>

{#if $isLoading}
  <div class="boot">Loading…</div>
{:else if $currentPage === 'program'}
  <ProgramPage />
{:else if $currentPage === 'vehicle'}
  <VehiclePage />
{:else if $currentPage === 'field'}
  <FieldPage />
{:else}
  <MapCanvas />
  <Drawer />

  <header class="topbar">
    <div class="brand">{$_('app.title')}</div>
    <div class="fps" title="Client render rate">
      <span class="fps-k">FPS</span>
      <span class="fps-v">{$renderFps > 0 ? $renderFps.toFixed(0) : '—'}</span>
    </div>
    <div class="conn" class:ok={$connState === 'connected'}>{connLabel}</div>
    <div class="langs" title={$_('language')}>
      <button onclick={() => setLanguage('en')}>EN</button>
      <button onclick={() => setLanguage('uk')}>UK</button>
    </div>
  </header>

  {#if landscape}
    <aside class="lane left">
      <SpeedWidget />
      <div class="spacer"></div>
      <SeedRateWidget />
    </aside>
    <aside class="lane right">
      <SingulationWidget />
      <DrivingControlsWidget />
    </aside>
  {:else}
    <aside class="lane top">
      <SpeedWidget />
      <SeedRateWidget />
    </aside>
    <aside class="lane bottom">
      <DrivingControlsWidget />
      <SingulationWidget />
    </aside>
  {/if}

  <div class="cams">
    <CameraControls />
  </div>
{/if}

<style>
  .boot {
    display: grid;
    place-items: center;
    height: 100%;
    color: var(--text-muted);
  }
  .topbar {
    position: fixed;
    top: var(--safe-t);
    left: var(--safe-l);
    right: var(--safe-r);
    z-index: 20;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    pointer-events: none;
  }
  .topbar > * {
    pointer-events: auto;
  }
  .brand {
    font-weight: 700;
    font-size: 16px;
    letter-spacing: 0.02em;
    text-shadow: 0 1px 8px rgba(0, 0, 0, 0.6);
  }
  .fps {
    display: inline-flex;
    align-items: baseline;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 8px;
    background: var(--panel);
    border: 1px solid var(--panel-border);
    font-variant-numeric: tabular-nums;
    text-shadow: none;
  }
  .fps-k {
    font-size: 11px;
    font-weight: 700;
    color: var(--text-muted);
    letter-spacing: 0.04em;
  }
  .fps-v {
    font-size: 15px;
    font-weight: 700;
    min-width: 2ch;
  }
  .conn {
    margin-left: auto;
    font-size: 12px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 999px;
    background: rgba(224, 85, 85, 0.25);
    border: 1px solid rgba(224, 85, 85, 0.5);
  }
  .conn.ok {
    background: rgba(62, 207, 122, 0.2);
    border-color: rgba(62, 207, 122, 0.55);
  }
  .langs {
    display: flex;
    gap: 4px;
  }
  .langs button {
    border: 1px solid var(--panel-border);
    background: var(--panel);
    color: var(--text);
    border-radius: 8px;
    padding: 6px 8px;
    font-size: 12px;
    font-weight: 700;
  }
  .lane {
    position: fixed;
    z-index: 15;
    display: flex;
    gap: 8px;
    pointer-events: none;
  }
  .lane > :global(*) {
    pointer-events: auto;
  }
  .lane.left {
    top: calc(52px + var(--safe-t));
    bottom: calc(12px + var(--safe-b));
    left: calc(10px + var(--safe-l));
    width: min(280px, 32vw);
    flex-direction: column;
  }
  .lane.right {
    top: calc(52px + var(--safe-t));
    right: calc(10px + var(--safe-r));
    width: min(280px, 32vw);
    flex-direction: column;
  }
  .lane.top {
    top: calc(52px + var(--safe-t));
    left: 50%;
    transform: translateX(-50%);
    flex-direction: column;
    width: min(320px, 90vw);
  }
  .lane.bottom {
    bottom: calc(12px + var(--safe-b));
    left: 50%;
    transform: translateX(-50%);
    flex-direction: column;
    width: min(320px, 90vw);
  }
  .spacer {
    flex: 1;
  }
  .cams {
    position: fixed;
    right: calc(10px + var(--safe-r));
    bottom: calc(12px + var(--safe-b));
    z-index: 16;
  }
</style>
