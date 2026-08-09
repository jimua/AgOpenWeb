export type Vec2 = { e: number; n: number }

export type Scene = {
  version: number
  originLat: number
  originLon: number
  hasField: boolean
  fieldName: string
  boundaries: Vec2[][]
  boundaryInner: boolean[]
  tracks: { id: string; name: string; type: number; points: Vec2[] }[]
  headland: Vec2[] | null
  guidanceLine: Vec2[] | null
  toolSections: { left: number; right: number }[]
  uTurnPath: Vec2[] | null
  nextTrack: Vec2[] | null
  flags: { e: number; n: number; color: string; name: string }[]
  tramLines: Vec2[][]
}

export type Tick = {
  sceneVersion: number
  pose: { e: number; n: number; heading: number; speed: number }
  fix: number
  sections: number[]
  crossTrackError: number
  guidanceActive: boolean
  lineLabel: string
  activeTrackName: string | null
  tool: { e: number; n: number; heading: number; ready: boolean }
  op: {
    autoSteer: boolean
    autoSteerAvail: boolean
    contour: boolean
    sectionAuto: boolean
    sectionManual: boolean
    youturn: boolean
    turnLeft: boolean
    distToTrigger: number
    trackClosed: boolean
    executing?: boolean
    passNumber?: number
  }
  hitchE: number
  hitchN: number
  hostMs: number
}

export type StatusBar = {
  fixQuality: number
  fixText: string
  age: number
  sats: number
  isMetric: boolean
  gpsOk: boolean
  jobName: string
  workedAreaSqM: number
  simEnabled: boolean
  simSpeedKph: number
}

export type ConnState = 'connecting.' | 'connected' | 'disconnected' | 'error' | string
