// AgOpenWeb
// Copyright (C) 2024-2026 AgOpenWeb Contributors
// SPDX-License-Identifier: Apache-2.0

import { equal } from 'node:assert/strict'
import { test } from 'node:test'
import { get } from 'svelte/store'
import { applyHostTelemetry, clearSeederTelemetry, seederTelemetry } from '../src/lib/stores/seederTelemetry.ts'

const stoppedSections = {
  count: 1,
  setpoint: 182_000,
  actual: 0,
  totalSingulation: 0,
  sections: [{ index: 1, isOn: false, singulationPercent: 0, seedRateActual: 0 }],
}

test('keeps reported zeros and expires readings when the host stops sending telemetry', ({ mock }) => {
  mock.timers.enable({ apis: ['setTimeout'] })
  equal(get(seederTelemetry), null)

  applyHostTelemetry(stoppedSections)
  mock.timers.tick(2_999)
  equal(get(seederTelemetry), stoppedSections)

  applyHostTelemetry(stoppedSections)
  mock.timers.tick(1)
  equal(get(seederTelemetry), stoppedSections)
  mock.timers.tick(2_999)
  equal(get(seederTelemetry), null)
})

test('clearing telemetry cancels the old expiry so a new session can publish immediately', ({ mock }) => {
  mock.timers.enable({ apis: ['setTimeout'] })
  applyHostTelemetry(stoppedSections)
  mock.timers.tick(1_000)
  clearSeederTelemetry()
  equal(get(seederTelemetry), null)

  const newReadings = { ...stoppedSections, setpoint: 200_000 }
  applyHostTelemetry(newReadings)
  mock.timers.tick(2_000)
  equal(get(seederTelemetry), newReadings)
  clearSeederTelemetry()
})
