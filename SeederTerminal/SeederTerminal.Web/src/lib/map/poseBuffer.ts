/**
 * Pose playback buffer — same approach as AgOpenWeb wwwroot/app.js.
 * Ticks arrive ~10 Hz; we draw at display refresh. Without interpolating between
 * buffered poses, the follow-camera snaps once per tick (~15 Hz feel) even at 120 FPS.
 */

export type BufferedPose = {
  e: number
  n: number
  heading: number
  speed: number
  tool: { e: number; n: number; heading: number; ready: boolean } | null
  /** Client receipt time (performance.now). */
  t: number
  /** Host monotonic ms from TickDto.hostMs. */
  hostT: number
}

export type SmoothPose = {
  e: number
  n: number
  heading: number
  speed: number
}

export type SmoothTool = {
  e: number
  n: number
  heading: number
}

const POSE_BUF_MAX = 12
const RENDER_DELAY = 130 // ms behind newest pose
const EXTRAP_CAP_MS = 200

const poseBuf: BufferedPose[] = []
let clockOffset: number | null = null

function lerpAngle(a: number, b: number, f: number): number {
  let d = b - a
  d -= 2 * Math.PI * Math.round(d / (2 * Math.PI))
  return a + d * f
}

/** Push an authoritative tick pose into the ring buffer. */
export function pushTickPose(tick: {
  pose?: { e: number; n: number; heading: number; speed: number } | null
  tool?: { e: number; n: number; heading: number; ready: boolean } | null
  hostMs?: number
}): void {
  if (!tick?.pose) return
  const entry: BufferedPose = {
    e: tick.pose.e,
    n: tick.pose.n,
    heading: tick.pose.heading,
    speed: tick.pose.speed,
    tool: tick.tool
      ? {
          e: tick.tool.e,
          n: tick.tool.n,
          heading: tick.tool.heading,
          ready: tick.tool.ready,
        }
      : null,
    t: performance.now(),
    hostT: typeof tick.hostMs === 'number' ? tick.hostMs : performance.now(),
  }

  const prev = poseBuf[poseBuf.length - 1]
  if (
    prev &&
    typeof tick.hostMs === 'number' &&
    typeof prev.hostT === 'number' &&
    tick.hostMs <= prev.hostT
  ) {
    poseBuf[poseBuf.length - 1] = entry
  } else {
    poseBuf.push(entry)
    if (poseBuf.length > POSE_BUF_MAX) poseBuf.shift()
  }

  if (typeof tick.hostMs === 'number') {
    const raw = entry.t - tick.hostMs
    clockOffset = clockOffset === null ? raw : clockOffset + 0.01 * (raw - clockOffset)
  }
}

type Sample = { a: BufferedPose; b: BufferedPose; f: number }

function sample(): Sample | null {
  const m = poseBuf.length
  if (m === 0) return null
  if (m === 1) return { a: poseBuf[0], b: poseBuf[0], f: 1 }

  const useHost = clockOffset !== null && typeof poseBuf[m - 1].hostT === 'number'
  const key: 'hostT' | 't' = useHost ? 'hostT' : 't'
  const playhead = useHost
    ? performance.now() - clockOffset! - RENDER_DELAY
    : performance.now() - RENDER_DELAY

  if (playhead <= poseBuf[0][key]) return { a: poseBuf[0], b: poseBuf[0], f: 0 }

  const nw = poseBuf[m - 1]
  if (playhead >= nw[key]) {
    const prev = poseBuf[m - 2]
    const span = nw[key] - prev[key]
    if (span <= 0) return { a: nw, b: nw, f: 1 }
    const over = Math.min(playhead - nw[key], EXTRAP_CAP_MS)
    return { a: prev, b: nw, f: 1 + over / span }
  }

  for (let i = 0; i < m - 1; i++) {
    const a = poseBuf[i]
    const b = poseBuf[i + 1]
    if (playhead >= a[key] && playhead < b[key]) {
      const span = b[key] - a[key]
      return { a, b, f: span > 0 ? (playhead - a[key]) / span : 1 }
    }
  }
  return { a: nw, b: nw, f: 1 }
}

/** Interpolated vehicle pose for the current animation frame. */
export function sampleRenderPose(): SmoothPose | null {
  const s = sample()
  if (!s) return null
  return {
    e: s.a.e + (s.b.e - s.a.e) * s.f,
    n: s.a.n + (s.b.n - s.a.n) * s.f,
    heading: lerpAngle(s.a.heading, s.b.heading, s.f),
    speed: s.b.speed,
  }
}

/** Interpolated tool pose for the current animation frame. */
export function sampleRenderTool(): SmoothTool | null {
  const s = sample()
  if (!s || !s.b.tool) return null
  const pt = s.a.tool || s.b.tool
  const qt = s.b.tool
  return {
    e: pt.e + (qt.e - pt.e) * s.f,
    n: pt.n + (qt.n - pt.n) * s.f,
    heading: lerpAngle(pt.heading, qt.heading, s.f),
  }
}

export function clearPoseBuffer(): void {
  poseBuf.length = 0
  clockOffset = null
}
