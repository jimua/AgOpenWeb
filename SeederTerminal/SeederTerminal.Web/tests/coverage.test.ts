// AgOpenWeb
// Copyright (C) 2024-2026 AgOpenWeb Contributors
// SPDX-License-Identifier: Apache-2.0

import { deepEqual, equal, notEqual } from 'node:assert/strict'
import { test } from 'node:test'
import { createDisplayTextureReporter } from '../src/lib/remote/displayTextureLimit.ts'
import { clearCoverageState, getCoverageState, queueCoverageCells, setCoverageEdges, setCoverageInit } from '../src/lib/map/coverageState.ts'

for (const rendererFirst of [true, false]) {
  test(`reports the texture limit once after ${rendererFirst ? 'renderer then operator' : 'operator then renderer'} readiness`, () => {
    const sent: string[] = []
    const reporter = createDisplayTextureReporter(command => sent.push(command))
    if (rendererFirst) reporter.setLimit(4096)
    else reporter.setOperator(true)
    deepEqual(sent, [])

    if (rendererFirst) reporter.setOperator(true)
    else reporter.setLimit(4096)
    reporter.setOperator(true)
    reporter.setLimit(4096)
    deepEqual(sent, ['display.maxTexture|4096'])

    reporter.disconnect()
    reporter.setOperator(false)
    equal(sent.length, 1)
    reporter.setOperator(true)
    deepEqual(sent, ['display.maxTexture|4096', 'display.maxTexture|4096'])
  })
}

test('growing twice before a draw preserves the raster generation and queued world positions', () => {
  clearCoverageState()
  const init = { cellSize: 0.25, originE: 0, originN: 0, width: 20, height: 20, reset: true }
  setCoverageInit(init)
  const original = getCoverageState().grid!
  queueCoverageCells(new Int32Array([3, 4, -1]))
  setCoverageInit({ ...init, originE: -1, width: 24, reset: false })
  setCoverageInit({ ...init, originE: -1, originN: -2, width: 24, height: 28, reset: false })
  const grown = getCoverageState()
  equal(grown.grid?.generation, original.generation)
  deepEqual([...grown.pending[0].cells], [7, 12, -1])

  setCoverageEdges([[{ e: 0, n: 0 }, { e: 1, n: 1 }]])
  setCoverageInit({ ...init, cellSize: 0.5 })
  notEqual(getCoverageState().grid?.generation, original.generation)
  deepEqual(getCoverageState().pending, [])
  deepEqual(getCoverageState().edges, [])

  setCoverageInit({ ...init, cellSize: 0, width: 0, height: 0 })
  queueCoverageCells(new Int32Array([3, 4, -1]))
  equal(getCoverageState().grid, null)
  deepEqual(getCoverageState().pending, [])
})
