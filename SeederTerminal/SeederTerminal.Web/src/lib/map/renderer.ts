/**
 * Good-enough CanvasKit map for SeederTerminal v1.
 * Ground texture + tractor sprite match AgOpenWeb’s CanvasKit path
 * (MakeFromCmds, MakeImageFromCanvasImageSource, tiled ground shader).
 */

import type { Scene, Tick } from '../remote/types'
import { sampleRenderPose, sampleRenderTool } from './poseBuffer'

declare global {
  interface Window {
    CanvasKitInit: (opts: { locateFile: (f: string) => string }) => Promise<CanvasKit>
  }
}

type CanvasKit = any

export type MapCamera = {
  pxPerM: number
  follow: boolean
  northUp: boolean
}

/** Section ColorCode → fill (same palette as AgOpenWeb SECTION_COLORS). */
const SECTION_COLORS: [number, number, number, number][] = [
  [90, 90, 90, 0.55], // 0 off
  [220, 60, 50, 0.9], // 1 on / work
  [50, 180, 80, 0.9], // 2
  [50, 140, 220, 0.9], // 3
  [180, 180, 60, 0.7], // 4
  [160, 80, 180, 0.85], // 5
]

const TILE_M = 50 // metres per ground-texture tile (native / AgOpenWeb)

/** Same 1-2-5 step picker AgOpenWeb/native use for grid spacing. */
function niceStep125(x: number): number {
  if (!(x > 0) || !Number.isFinite(x)) return 1
  const exp = Math.floor(Math.log10(x))
  const f = x / Math.pow(10, exp)
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10
  return nice * Math.pow(10, exp)
}

export async function loadCanvasKit(): Promise<CanvasKit> {
  if (!(window as any).CanvasKitInit) {
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement('script')
      s.src = '/vendor/canvaskit.js'
      s.onload = () => resolve()
      s.onerror = () => reject(new Error('Failed to load CanvasKit'))
      document.head.appendChild(s)
    })
  }
  return window.CanvasKitInit({
    locateFile: (f) => `/vendor/${f}`,
  })
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load ${src}`))
    img.src = src
  })
}

export type MapRenderer = {
  resize: (cssW: number, cssH: number, dpr: number) => void
  draw: (scene: Scene | null, tick: Tick | null, cam: MapCamera) => void
  dispose: () => void
}

export function createMapRenderer(canvas: HTMLCanvasElement, CK: CanvasKit): MapRenderer {
  let surface: any = null
  let dpr = 1
  let vw = 1
  let vh = 1

  let groundImg: HTMLImageElement | null = null
  let skGround: any = null
  let groundPaint: any = null
  let groundShader: any = null

  let tractorImg: HTMLImageElement | null = null
  let skTractor: any = null
  let disposed = false

  const safeDelete = (obj: any) => {
    if (!obj) return
    try {
      obj.delete?.()
    } catch {
      /* already deleted / WASM binding gone */
    }
  }

  // Load assets asynchronously; draw() uses them when ready.
  void loadHtmlImage('/icons/GroundTextureLight.png')
    .then((img) => {
      if (!disposed) groundImg = img
    })
    .catch(() => {
      return loadHtmlImage('/icons/GroundTextureDark.png').then((img) => {
        if (!disposed) groundImg = img
      })
    })
    .catch(() => {
      /* keep solid clear until assets available */
    })

  void loadHtmlImage('/icons/TractorAoG.png')
    .then((img) => {
      if (!disposed) tractorImg = img
    })
    .catch(() => {
      /* triangle fallback */
    })

  const recreate = () => {
    if (disposed) return
    surface?.dispose?.()
    surface = CK.MakeWebGLCanvasSurface(canvas)
  }

  const resize = (cssW: number, cssH: number, devicePixelRatio: number) => {
    dpr = Math.min(devicePixelRatio || 1, 2)
    vw = cssW
    vh = cssH
    canvas.width = Math.round(cssW * dpr)
    canvas.height = Math.round(cssH * dpr)
    canvas.style.width = `${cssW}px`
    canvas.style.height = `${cssH}px`
    recreate()
  }

  const ensureGround = () => {
    if (skGround || !groundImg || !groundImg.complete || groundImg.naturalWidth === 0) return
    skGround = CK.MakeImageFromCanvasImageSource(groundImg)
    if (!groundPaint) {
      groundPaint = new CK.Paint()
      groundPaint.setAntiAlias(false)
    }
  }

  const ensureTractor = () => {
    if (skTractor || !tractorImg || !tractorImg.complete || tractorImg.naturalWidth === 0) return
    skTractor = CK.MakeImageFromCanvasImageSource(tractorImg)
  }

  const drawGroundTexture = (sk: any, camE: number, camN: number, pxPerM: number) => {
    ensureGround()
    if (!skGround || !groundPaint) return

    // We draw AFTER translate(-cam), so canvas coords are WORLD E/N.
    // Shader must be world-anchored (no cam mod phase). AgOpenWeb draws the
    // ground in CAMERA-relative space and applies cam%50 in the local matrix —
    // doing both world coords AND cam phase made the texture slide vs the grid.
    if (!groundShader) {
      const W = skGround.width()
      const H = skGround.height()
      const lm = [TILE_M / W, 0, 0, 0, TILE_M / H, 0, 0, 0, 1]
      groundShader = skGround.makeShaderOptions(
        CK.TileMode.Repeat,
        CK.TileMode.Repeat,
        CK.FilterMode.Linear,
        CK.MipmapMode.Linear,
        lm,
      )
      groundPaint.setShader(groundShader)
    }

    const half = Math.max(Math.max(vw, vh) / pxPerM, 300)
    sk.drawRect(CK.LTRBRect(camE - half, camN - half, camE + half, camN + half), groundPaint)
  }

  const pathFromPts = (pts: { e: number; n: number }[], close = true) => {
    if (!pts?.length) return null
    const cmds: number[] = [CK.MOVE_VERB, pts[0].e, pts[0].n]
    for (let i = 1; i < pts.length; i++) cmds.push(CK.LINE_VERB, pts[i].e, pts[i].n)
    if (close) cmds.push(CK.CLOSE_VERB)
    return CK.Path.MakeFromCmds(cmds)
  }

  const poly = (sk: any, pts: { e: number; n: number }[], paint: any, close = true) => {
    const path = pathFromPts(pts, close)
    if (!path) return
    sk.drawPath(path, paint)
    path.delete()
  }

  const stroke = (r: number, g: number, b: number, a = 1, w = 1.5) => {
    const p = new CK.Paint()
    p.setStyle(CK.PaintStyle.Stroke)
    p.setStrokeWidth(w)
    p.setColor(CK.Color(r, g, b, a))
    p.setAntiAlias(true)
    p.setStrokeCap(CK.StrokeCap.Round)
    p.setStrokeJoin(CK.StrokeJoin.Round)
    return p
  }

  const fill = (r: number, g: number, b: number, a = 1) => {
    const p = new CK.Paint()
    p.setStyle(CK.PaintStyle.Fill)
    p.setColor(CK.Color(r, g, b, a))
    p.setAntiAlias(true)
    return p
  }

  const lineW = (metres: number, pxPerM: number) =>
    Math.min(Math.max(metres * pxPerM, 1.5), 4) / pxPerM

  const draw = (scene: Scene | null, tick: Tick | null, cam: MapCamera) => {
    if (disposed) return
    if (!surface) recreate()
    if (!surface) return
    const sk = surface.getCanvas()

    // Day-ish clear while texture loads (closer to AgOpenWeb day map).
    sk.clear(CK.Color(200, 205, 210, 1))
    sk.save()
    sk.scale(dpr, dpr)

    // Smooth pose between ~10 Hz ticks (AgOpenWeb poseBuf + RENDER_DELAY).
    // Using raw tick.pose here made the follow-camera snap once per tick.
    const smooth = sampleRenderPose()
    const smoothTool = sampleRenderTool()
    const pose = smooth ?? tick?.pose ?? null
    const cx = pose?.e ?? 0
    const cy = pose?.n ?? 0
    const heading = pose?.heading ?? 0
    const scale = cam.pxPerM

    sk.translate(vw / 2, vh / 2)
    if (!cam.northUp && cam.follow) {
      sk.rotate((-heading * 180) / Math.PI, 0, 0)
    }
    sk.scale(scale, -scale) // N up in world → screen Y down flip
    if (cam.follow) sk.translate(-cx, -cy)

    // 1) Tiled ground texture
    drawGroundTexture(sk, cx, cy, scale)

    // 2) Grid over texture — world-metre strokes like AgOpenWeb drawGridSk
    // (minor/major × gridMult=6). 1/pxPerM-style widths were ~1 CSS px and vanished
    // on the ground texture.
    {
      const wpp = 1 / scale
      const gm = 6
      const minorW = Math.max(0.3 * wpp, 0.05) * gm
      const majorW = Math.max(0.6 * wpp, 0.1) * gm
      // Day palette (we use the light ground tile)
      const minor = stroke(80, 92, 110, 0.33, minorW)
      const major = stroke(60, 72, 90, 0.5, majorW)
      const toolW = 6 // default implement width until config is wired
      const viewSpan = Math.max(vw, vh) / scale
      const spacing = Math.max(niceStep125(viewSpan / (toolW * 30)) * toolW, 1)
      const half = Math.max(viewSpan / 2, 180) * (cam.northUp ? 1 : Math.SQRT2)
      const minE = cx - half
      const maxE = cx + half
      const minN = cy - half
      const maxN = cy + half
      const i0 = Math.ceil(minE / spacing)
      const i1 = Math.floor(maxE / spacing)
      const j0 = Math.ceil(minN / spacing)
      const j1 = Math.floor(maxN / spacing)
      for (let i = i0; i <= i1; i++) {
        const x = i * spacing
        const paint = i % 10 === 0 ? major : minor
        sk.drawLine(x, minN, x, maxN, paint)
      }
      for (let j = j0; j <= j1; j++) {
        const y = j * spacing
        const paint = j % 10 === 0 ? major : minor
        sk.drawLine(minE, y, maxE, y, paint)
      }
      minor.delete()
      major.delete()
    }

    // 3) Field geometry
    if (scene) {
      const bp = stroke(40, 200, 90, 1, lineW(3, scale))
      for (let i = 0; i < scene.boundaries.length; i++) {
        poly(sk, scene.boundaries[i], bp, true)
      }
      bp.delete()

      const tp = stroke(90, 160, 230, 0.85, lineW(1.5, scale))
      for (const t of scene.tracks) poly(sk, t.points, tp, false)
      tp.delete()

      if (scene.guidanceLine?.length) {
        const gp = stroke(40, 220, 90, 1, lineW(1.5, scale))
        poly(sk, scene.guidanceLine, gp, false)
        gp.delete()
      }
      if (scene.headland?.length) {
        const hp = stroke(60, 220, 180, 0.85, lineW(2, scale))
        poly(sk, scene.headland, hp, true)
        hp.delete()
      }
      if (scene.uTurnPath?.length) {
        const up = stroke(255, 140, 60, 0.95, lineW(2, scale))
        poly(sk, scene.uTurnPath, up, false)
        up.delete()
      }
    }

    // 4) Tool sections — use interpolated tool pose so the bar glides with the tractor.
    const toolPose = smoothTool ?? (tick?.tool ? { e: tick.tool.e, n: tick.tool.n, heading: tick.tool.heading } : null)
    if (scene?.toolSections?.length && toolPose && (toolPose.e !== 0 || toolPose.n !== 0 || pose)) {
      const th = toolPose.heading
      const te = toolPose.e
      const tn = toolPose.n
      const ps = Math.sin(th + Math.PI / 2)
      const pc = Math.cos(th + Math.PI / 2)
      const hs = Math.sin(th)
      const hc = Math.cos(th)
      const depth = 1.0
      const halfGap = 0.025
      for (let i = 0; i < scene.toolSections.length; i++) {
        const span = scene.toolSections[i]
        const L = span.left + halfGap
        const R = span.right - halfGap
        if (R - L < 0.01) continue
        const code = tick?.sections[i] ?? 0
        const col = SECTION_COLORS[code] ?? SECTION_COLORS[0]
        const sp = fill(col[0], col[1], col[2], col[3])
        const corners = [
          [L, -depth],
          [R, -depth],
          [R, depth],
          [L, depth],
        ] as const
        const cmds: number[] = []
        for (let k = 0; k < 4; k++) {
          const off = corners[k][0]
          const d = corners[k][1]
          const e = te + ps * off + hs * d
          const n = tn + pc * off + hc * d
          cmds.push(k === 0 ? CK.MOVE_VERB : CK.LINE_VERB, e, n)
        }
        cmds.push(CK.CLOSE_VERB)
        const path2 = CK.Path.MakeFromCmds(cmds)
        if (path2) {
          sk.drawPath(path2, sp)
          path2.delete()
        }
        sp.delete()
      }
    }

    // 5) Vehicle — TractorAoG sprite, else triangle
    if (pose) {
      ensureTractor()
      const trackWidth = 2.0
      const wheelbase = 3.2
      if (skTractor) {
        const SPR_REAR = 0.245
        const SPR_FRONT = 0.75
        const SPR_HALFX = 0.245
        const bW = trackWidth / (2 * SPR_HALFX)
        const bH = wheelbase / (SPR_FRONT - SPR_REAR)
        const half = bW / 2
        const top = (1 - SPR_REAR) * bH
        const bot = -SPR_REAR * bH
        sk.save()
        sk.translate(pose.e, pose.n)
        sk.rotate((-pose.heading * 180) / Math.PI, 0, 0)
        sk.scale(1, -1)
        sk.drawImageRectOptions(
          skTractor,
          CK.LTRBRect(0, 0, skTractor.width(), skTractor.height()),
          CK.LTRBRect(-half, -top, half, -bot),
          CK.FilterMode.Linear,
          CK.MipmapMode.None,
          null,
        )
        sk.restore()
      } else {
        const len = 4.5
        const wid = 2.2
        const h = pose.heading
        const tipE = pose.e + Math.sin(h) * len
        const tipN = pose.n + Math.cos(h) * len
        const lx = pose.e - Math.sin(h) * len * 0.35 - Math.cos(h) * wid
        const ly = pose.n - Math.cos(h) * len * 0.35 + Math.sin(h) * wid
        const rx = pose.e - Math.sin(h) * len * 0.35 + Math.cos(h) * wid
        const ry = pose.n - Math.cos(h) * len * 0.35 - Math.sin(h) * wid
        const vp = fill(70, 170, 255, 0.95)
        const path = CK.Path.MakeFromCmds([
          CK.MOVE_VERB,
          tipE,
          tipN,
          CK.LINE_VERB,
          lx,
          ly,
          CK.LINE_VERB,
          rx,
          ry,
          CK.CLOSE_VERB,
        ])
        if (path) {
          sk.drawPath(path, vp)
          path.delete()
        }
        vp.delete()
      }
    }

    sk.restore()
    surface.flush()
  }

  const dispose = () => {
    if (disposed) return
    disposed = true
    try {
      groundPaint?.setShader?.(null)
    } catch {
      /* ignore */
    }
    // Paint no longer owns the shader — delete shader once, then paint/images.
    safeDelete(groundShader)
    groundShader = null
    safeDelete(groundPaint)
    groundPaint = null
    safeDelete(skGround)
    skGround = null
    safeDelete(skTractor)
    skTractor = null
    try {
      surface?.dispose?.()
    } catch {
      /* ignore */
    }
    surface = null
  }

  return { resize, draw, dispose }
}
