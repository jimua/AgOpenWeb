import { writable, derived, get } from 'svelte/store'
import { createRemoteTransport } from './transport.js'
import { createDisplayTextureReporter } from './displayTextureLimit'
import type {
  Scene,
  Tick,
  StatusBar,
  ConnState,
  Config,
  Profiles,
  FieldOps,
  AgShare,
  PageType,
  SeederTelemetryDto,
} from './types'
import { pushTickPose, clearPoseBuffer } from '../map/poseBuffer'
import { clearCoverageState, queueCoverageCells, setCoverageEdges, setCoverageInit, type CoverageInit } from '../map/coverageState'
import { applyHostTelemetry, clearSeederTelemetry } from '../stores/seederTelemetry'

export const currentPage = writable<PageType>('main')

export const scene = writable<Scene | null>(null)
export const tick = writable<Tick | null>(null)
export const config = writable<Config | null>(null)
export const profiles = writable<Profiles | null>(null)
export const fieldOps = writable<FieldOps | null>(null)
export const agShare = writable<AgShare | null>(null)
export const statusBar = writable<StatusBar | null>(null)
export const connState = writable<ConnState>('connecting.')
export const clientId = writable<string | null>(null)

export const speedKph = derived([tick, statusBar], ([$tick, $status]) => {
  if ($status?.simEnabled) return $status.simSpeedKph ?? 0
  const ms = $tick?.pose.speed ?? 0
  return ms * 3.6
})

export const isMetric = derived(statusBar, ($s) => $s?.isMetric ?? true)

let transport: ReturnType<typeof createRemoteTransport> | null = null
let presenceTimer: ReturnType<typeof setInterval> | null = null
const displayTexture = createDisplayTextureReporter(sendCommand)

export function setDisplayTextureLimit(side: number) {
  displayTexture.setLimit(side)
}

export function startRemote() {
  if (transport) return transport
  let id: string | null = null
  let control: { held: boolean; holderId: string } | null = null

  function updateOperator() {
    displayTexture.setOperator(!!id && !!control?.held && control.holderId === id)
    if (id && control && !control.held) sendCommand('control.acquire|SeederTerminal')
  }

  transport = createRemoteTransport({
    onScene: (s: Scene) => scene.set(s),
    onTick: (t: Tick) => {
      tick.set(t)
      pushTickPose(t)
    },
    onCoverageInit: (init: CoverageInit) => setCoverageInit(init),
    onCoverageCells: ({ cells }: { cells: Int32Array }) => queueCoverageCells(cells),
    onCoverageEdge: setCoverageEdges,
    onConfig: (c: Config) => config.set(c),
    onProfiles: (p: Profiles) => profiles.set(p),
    onFieldOps: (f: FieldOps) => fieldOps.set(f),
    onAgShare: (a: AgShare) => agShare.set(a),
    onStatusBar: (s: StatusBar) => statusBar.set(s),
    onSeederTelemetry: (d: SeederTelemetryDto) => applyHostTelemetry(d),
    onHello: (value: string) => {
      id = value
      clientId.set(value)
      updateOperator()
    },
    onControlState: (value: { held: boolean; holderId: string }) => {
      control = value
      updateOperator()
    },
    onStatus: (s: string) => {
      connState.set(s)
      if (s === 'connected') {
        if (!presenceTimer) {
          presenceTimer = setInterval(() => transport?.send('control.presence'), 500)
        }
      } else {
        clearSeederTelemetry()
        id = null
        control = null
        clientId.set(null)
        displayTexture.disconnect()
        if (presenceTimer) clearInterval(presenceTimer)
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
  displayTexture.disconnect()
  transport?.stop()
  transport = null
  clearSeederTelemetry()
  clearPoseBuffer()
  clearCoverageState()
}

export function getConnSnapshot() {
  return get(connState)
}
