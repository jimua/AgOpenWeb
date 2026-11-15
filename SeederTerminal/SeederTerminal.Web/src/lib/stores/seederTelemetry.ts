import { writable } from 'svelte/store'
import type { SeederTelemetryDto } from '../remote/types'

const telemetry = writable<SeederTelemetryDto | null>(null)
const TELEMETRY_TIMEOUT_MS = 3_000
let expiry: ReturnType<typeof setTimeout> | undefined

export const seederTelemetry = { subscribe: telemetry.subscribe }

export function applyHostTelemetry(data: SeederTelemetryDto) {
  clearTimeout(expiry)
  expiry = setTimeout(clearSeederTelemetry, TELEMETRY_TIMEOUT_MS)
  telemetry.set(data)
}

export function clearSeederTelemetry() {
  clearTimeout(expiry)
  expiry = undefined
  telemetry.set(null)
}
