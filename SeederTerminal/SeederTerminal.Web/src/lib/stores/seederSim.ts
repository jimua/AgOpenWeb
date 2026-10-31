import { writable, get } from 'svelte/store'
import { sectionStates } from '../remote/session'
import type { SeederTelemetryDto } from '../remote/types'

export type SectionTelemetry = {
  index: number
  isOn: boolean
  singulationPercent: number
  seedRateActual: number
}

const SECTION_COUNT_FALLBACK = 6

function randAround(base: number, spread: number) {
  return Math.max(0, Math.min(100, base + (Math.random() - 0.5) * spread))
}

export const simulatedSections = writable<SectionTelemetry[]>(
  Array.from({ length: SECTION_COUNT_FALLBACK }, (_, i) => ({
    index: i + 1,
    isOn: false,
    singulationPercent: 0,
    seedRateActual: 0,
  })),
)

export const totalSingulation = writable(0)
export const seedRateSetpoint = writable(182_000)
export const seedRateActual = writable(0)

let hasReceivedHostTelemetry = false
let simTimer: ReturnType<typeof setInterval> | null = null
let devFallbackTimeout: ReturnType<typeof setTimeout> | null = null

export function applyHostTelemetry(data: SeederTelemetryDto) {
  if (!data || data.count <= 0) return
  hasReceivedHostTelemetry = true
  if (devFallbackTimeout) {
    clearTimeout(devFallbackTimeout)
    devFallbackTimeout = null
  }
  if (simTimer) {
    clearInterval(simTimer)
    simTimer = null
  }

  seedRateSetpoint.set(data.setpoint)
  seedRateActual.set(data.actual)
  totalSingulation.set(data.totalSingulation)
  simulatedSections.set(data.sections)
}

function runSimTick() {
  if (hasReceivedHostTelemetry) return
  const sections = get(sectionStates)
  const count = Math.max(sections.length || SECTION_COUNT_FALLBACK, 1)
  const setpoint = get(seedRateSetpoint)
  const next: SectionTelemetry[] = []
  for (let i = 0; i < count; i++) {
    const code = sections[i] ?? 0
    // Planting: 1 (manual-on), 2 (auto-on), 3 (turning-off)
    const isOn = code === 1 || code === 2 || code === 3
    const singulation = isOn ? randAround(97, 6) : 0
    const rate = isOn ? setpoint * (0.96 + Math.random() * 0.08) : 0
    next.push({
      index: i + 1,
      isOn,
      singulationPercent: singulation,
      seedRateActual: rate,
    })
  }
  simulatedSections.set(next)
  const on = next.filter((x) => x.isOn)
  totalSingulation.set(on.length ? on.reduce((a, b) => a + b.singulationPercent, 0) / on.length : 0)
  seedRateActual.set(on.length ? on.reduce((a, b) => a + b.seedRateActual, 0) / on.length : 0)
}

export function startSeederSimulation() {
  if (hasReceivedHostTelemetry) return
  if (simTimer || devFallbackTimeout) return

  // Wait ~1.5s before starting dev fallback simulation so Desktop WebView does not flash fake numbers
  devFallbackTimeout = setTimeout(() => {
    devFallbackTimeout = null
    if (hasReceivedHostTelemetry) return
    runSimTick()
    simTimer = setInterval(runSimTick, 900)
  }, 1500)
}

export function stopSeederSimulation() {
  if (devFallbackTimeout) {
    clearTimeout(devFallbackTimeout)
    devFallbackTimeout = null
  }
  if (simTimer) {
    clearInterval(simTimer)
    simTimer = null
  }
}
