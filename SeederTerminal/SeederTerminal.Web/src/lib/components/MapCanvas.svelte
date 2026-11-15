<script lang="ts">
  import { onMount } from 'svelte'
  import { get } from 'svelte/store'
  import { scene, tick, config, setDisplayTextureLimit } from '../remote/session'
  import { pxPerM, followVehicle, northUp } from '../map/camera'
  import { createMapRenderer, loadCanvasKit, type MapRenderer } from '../map/renderer'
  import { noteFrame, resetFps } from '../stores/fps'

  let canvas: HTMLCanvasElement
  let renderer: MapRenderer | null = null
  let raf = 0
  let error = ''

  onMount(() => {
    let removeResize: (() => void) | undefined
    let alive = true
    ;(async () => {
      try {
        const CK = await loadCanvasKit()
        if (!alive) return
        renderer = createMapRenderer(canvas, CK, setDisplayTextureLimit)
        const resize = () => {
          renderer?.resize(window.innerWidth, window.innerHeight, window.devicePixelRatio || 1)
        }
        resize()
        window.addEventListener('resize', resize)
        removeResize = () => window.removeEventListener('resize', resize)

        const loop = (now: number) => {
          if (!alive || !renderer) return
          noteFrame(now)
          renderer.draw(get(scene), get(tick), get(config), {
            pxPerM: get(pxPerM),
            follow: get(followVehicle),
            northUp: get(northUp),
          })
          raf = requestAnimationFrame(loop)
        }
        raf = requestAnimationFrame(loop)
      } catch (e) {
        if (alive) error = e instanceof Error ? e.message : String(e)
      }
    })()

    // Single cleanup path only — do not also dispose in onDestroy (HMR double-free).
    return () => {
      alive = false
      removeResize?.()
      cancelAnimationFrame(raf)
      renderer?.dispose()
      renderer = null
      resetFps()
    }
  })
</script>

<canvas bind:this={canvas} class="map-canvas" aria-label="Guidance map"></canvas>
{#if error}
  <div class="error">{error} — check that the guidance backend is running and map assets loaded.</div>
{/if}

<style>
  .map-canvas {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    touch-action: none;
    z-index: 0;
  }
  .error {
    position: fixed;
    inset: auto 12px 12px 12px;
    z-index: 50;
    padding: 10px 14px;
    border-radius: 10px;
    background: rgba(120, 30, 30, 0.9);
    color: #fff;
    font-size: 13px;
  }
</style>
