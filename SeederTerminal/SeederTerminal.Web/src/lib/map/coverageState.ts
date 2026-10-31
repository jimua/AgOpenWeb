export type CoverageInit = {
  cellSize: number
  originE: number
  originN: number
  width: number
  height: number
  reset: boolean
}

export type CoverageBatch = {
  cells: Int32Array
  t: number
  off: number
}

export type CoverageGrid = CoverageInit & {
  version: number
  reanchor: boolean
  offsetX: number
  offsetY: number
}

const RENDER_DELAY = 130
let grid: CoverageGrid | null = null
let pending: CoverageBatch[] = []
let edges: { e: number; n: number }[][] = []
let version = 0
let edgeVersion = 0

export function setCoverageInit(init: CoverageInit): void {
  const old = grid
  const sameSize = old && Math.abs(old.cellSize - init.cellSize) < 1e-9
  if (old && !init.reset && sameSize && old.width === init.width && old.height === init.height &&
    Math.abs(old.originE - init.originE) <= 1e-9 && Math.abs(old.originN - init.originN) <= 1e-9) return
  const reanchor = !!old && !init.reset && sameSize &&
    (old.width !== init.width || old.height !== init.height ||
      Math.abs(old.originE - init.originE) > 1e-9 || Math.abs(old.originN - init.originN) > 1e-9)
  const offsetX = reanchor ? Math.round((old!.originE - init.originE) / init.cellSize) : 0
  const offsetY = reanchor ? Math.round((old!.originN - init.originN) / init.cellSize) : 0

  if (reanchor) {
    for (const batch of pending) {
      for (let i = 0; i + 2 < batch.cells.length; i += 3) {
        batch.cells[i] += offsetX
        batch.cells[i + 1] += offsetY
      }
    }
  } else {
    pending = []
  }

  version++
  grid = { ...init, version, reanchor: !!reanchor, offsetX, offsetY }
  if (init.reset) edges = []
}

export function queueCoverageCells(cells: Int32Array): void {
  if (!grid || cells.length === 0) return
  pending.push({ cells, t: performance.now(), off: 0 })
}

export function setCoverageEdges(value: { e: number; n: number }[][]): void {
  edges = value
  edgeVersion++
}

export function getCoverageState() {
  return { grid, pending, edges, edgeVersion, renderDelay: RENDER_DELAY }
}

export function clearCoverageState(): void {
  grid = null
  pending = []
  edges = []
  version++
  edgeVersion++
}
