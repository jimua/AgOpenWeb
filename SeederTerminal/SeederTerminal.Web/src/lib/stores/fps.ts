import { writable } from 'svelte/store'

/** Smoothed client render FPS (rAF), same measurement window as AgOpenWeb (~500 ms). */
export const renderFps = writable(0)

let frames = 0
let t0 = 0

/** Call once per animation frame from the map loop. */
export function noteFrame(now = performance.now()) {
  if (t0 === 0) {
    t0 = now
    return
  }
  frames++
  const dt = now - t0
  if (dt >= 500) {
    renderFps.set((frames * 1000) / dt)
    frames = 0
    t0 = now
  }
}

export function resetFps() {
  frames = 0
  t0 = 0
  renderFps.set(0)
}
