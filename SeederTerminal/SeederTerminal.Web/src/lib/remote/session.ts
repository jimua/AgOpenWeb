import { writable, derived, get } from 'svelte/store'
import { createRemoteTransport } from './transport.js'
import type { Scene, Tick, StatusBar, ConnState } from './types'
import { pushTickPose, clearPoseBuffer } from '../map/poseBuffer'

export const scene = writable<Scene | null>(null)
export const tick = writable<Tick | null>(null)
export const statusBar = writable<StatusBar | null>(null)
export const connState = writable<ConnState>('connecting.')
export const clientId = writable<string | null>(null)

export const speedKph = derived([tick, statusBar], ([$tick, $status]) => {
  if ($status?.simEnabled) return $status.simSpeedKph
  const ms = $tick?.pose.speed ?? 0
  return ms * 3.6
})

export const sectionStates = derived(tick, ($t) => $t?.sections ?? [])
export const isMetric = derived(statusBar, ($s) => $s?.isMetric ?? true)

let transport: ReturnType<typeof createRemoteTransport> | null = null
let presenceTimer: ReturnType<typeof setInterval> | null = null

export function startRemote() {
  if (transport) return transport
  transport = createRemoteTransport({
    onScene: (s: Scene) => scene.set(s),
    onTick: (t: Tick) => {
      tick.set(t)
      pushTickPose(t)
    },
    onStatusBar: (s: StatusBar) => statusBar.set(s),
    onHello: (id: string) => clientId.set(id),
    onStatus: (s: string) => {
      connState.set(s)
      if (s === 'connected') {
        transport?.send('control.acquire|SeederTerminal')
        if (!presenceTimer) {
          presenceTimer = setInterval(() => transport?.send('control.presence'), 500)
        }
      } else if (presenceTimer) {
        clearInterval(presenceTimer)
        presenceTimer = null
      }
    },
  })
  transport.start()
  return transport
}

export function sendCommand(cmd: string) {
  transport?.send(cmd)
}

export function stopRemote() {
  if (presenceTimer) clearInterval(presenceTimer)
  presenceTimer = null
  transport?.stop()
  transport = null
  clearPoseBuffer()
}

export function getConnSnapshot() {
  return get(connState)
}
