import { writable, get } from 'svelte/store'
import { sectionStates } from '../remote/session'

export type SectionTelemetry = {
  index: number
  isOn: boolean
  singulationPercent: number
}

const SECTION_COUNT_FALLBACK = 6

function randAround(base: number, spread: number) {
  return Math.max(0, Math.min(100, base + (Math.random() - 0.5) * spread))
}

export const simulatedSections = writable<SectionTelemetry[]>(
  Array.from({ length: SECTION_COUNT_FALLBACK }, (_, i) => ({
    index: i + 1,
    isOn: false,
    singulationPercent: 96,
  })),
)

export const totalSingulation = writable(0)
export const seedRateSetpoint = writable(182_000)
export const seedRateActual = writable(178_000)

let timer: ReturnType<typeof setInterval> | null = null

function refreshDerived(list: SectionTelemetry[]) {
  const on = list.filter((x) => x.isOn)
  totalSingulation.set(on.length ? on.reduce((a, b) => a + b.singulationPercent, 0) / on.length : 0)
  const participation = list.length ? on.length / list.length : 0
  seedRateActual.set(get(seedRateSetpoint) * participation * (0.96 + Math.random() * 0.08))
}

export function startSeederSimulation() {
  if (timer) return
  timer = setInterval(() => {
    const sections = get(sectionStates)
    const count = Math.max(sections.length || SECTION_COUNT_FALLBACK, 1)
    const next: SectionTelemetry[] = []
    for (let i = 0; i < count; i++) {
      const code = sections[i] ?? 0
      const isOn = code > 0 && code !== 4
      next.push({
        index: i + 1,
        isOn,
        singulationPercent: isOn ? randAround(97, 6) : 0,
      })
    }
    simulatedSections.set(next)
    refreshDerived(next)
  }, 900)
}

export function stopSeederSimulation() {
  if (timer) clearInterval(timer)
  timer = null
}
