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
  tools?: {
    headlandOn: boolean
    sectionInHeadland?: boolean
    autoTrack?: boolean
    skipRows?: number
    skipRowsOn?: boolean
    tramMode?: number
  }
  hitchE: number
  hitchN: number
  hostMs: number
}

export type VehicleConfig = {
  name?: string
  type?: number
  hitchType?: number
  hitchLength?: number
  wheelbase?: number
  trackWidth?: number
  antennaPivot?: number
  antennaHeight?: number
  antennaOffset?: number
}

export type ToolConfig = {
  type?: number
  hitchType?: number
  hitchLength?: number
  trailingHitchLength?: number
  tankTrailingHitchLength?: number
  length?: number
  lookAheadOn?: number
  lookAheadOff?: number
  turnOffDelay?: number
  offset?: number
  overlap?: number
  trailingToolToPivotLength?: number
  isSectionsNotZones?: boolean
  numSections?: number
  defaultSectionWidth?: number
  sectionWidths?: number[]
  zones?: number
  zoneRanges?: number[]
  isMultiColoredSections?: boolean
  sectionColors?: number[]
  singleCoverageColor?: number
  isSectionOffWhenOut?: boolean
  isHeadlandSectionControl?: boolean
  minCoverage?: number
  slowSpeedCutoff?: number
  coverageMargin?: number
  isWorkSwitchEnabled?: boolean
  isWorkSwitchActiveLow?: boolean
  isWorkSwitchManualSections?: boolean
  isSteerSwitchEnabled?: boolean
  isSteerSwitchManualSections?: boolean
  totalWidth?: number
}

export type DisplayConfig = {
  gridVisible?: boolean
  fieldTextureVisible?: boolean
  fieldTextureMoveable?: boolean
  svennArrowVisible?: boolean
  headlandDistanceVisible?: boolean
  lineSmoothEnabled?: boolean
  autoDayNight?: boolean
  hardwareMessagesEnabled?: boolean
  extraGuidelines?: boolean
  extraGuidelinesCount?: number
  resolutionLabel?: string
  uTurnButtonVisible?: boolean
  lateralButtonVisible?: boolean
  autoSteerSound?: boolean
  uTurnSound?: boolean
  hydraulicSound?: boolean
  sectionsSound?: boolean
  keyboardEnabled?: boolean
  startFullscreen?: boolean
  elevationLogEnabled?: boolean
  resolutionMultiplier?: number
  isDayMode?: boolean
}

export type Config = {
  vehicle?: VehicleConfig
  tool?: ToolConfig
  display?: DisplayConfig
  gps?: Record<string, any>
  roll?: Record<string, any>
  uturn?: Record<string, any>
  tram?: Record<string, any>
  machine?: Record<string, any>
  autosteer?: Record<string, any>
}

export type ProfileItem = {
  name: string
  preview: string
}

export type Profiles = {
  activeVehicle: string
  activeTool: string
  vehicles: ProfileItem[]
  tools: ProfileItem[]
}

export type FieldItem = {
  name: string
  hasDistance: boolean
  distanceKm: number
  areaHa: number
}

export type JobItem = {
  fieldName: string
  taskName: string
  workType: string
  status: number
  lastOpened: string
  notes: string
}

export type FieldOps = {
  fields: FieldItem[]
  jobs: JobItem[]
  workTypes: string[]
  isoFiles: string[]
  kmlFiles: string[]
  activeField: string
}

export type AgShareLocalField = {
  name: string
  hasBoundary: boolean
}

export type AgShareCloudField = {
  id: string
  name: string
  areaHa: number
}

export type AgShare = {
  serverUrl: string
  apiKey: string
  enabled: boolean
  status: string
  busy: boolean
  localFields: AgShareLocalField[]
  cloudFields: AgShareCloudField[]
}

export type StatusBar = {
  fixQuality?: number
  fixText?: string
  age?: number
  sats?: number
  isMetric?: boolean
  gpsOk?: boolean
  imuOk?: boolean
  autoSteerOk?: boolean
  machineOk?: boolean
  jobName?: string
  workedAreaSqM?: number
  simEnabled?: boolean
  simSpeedKph?: number
  simSteerAngle?: number
  sim10x?: boolean
  unsavedCoveragePrompt?: boolean
  driftEasting?: number
  driftNorthing?: number
}

export type ConnState = 'connecting.' | 'connected' | 'disconnected' | 'error' | string

export type PageType = 'main' | 'program' | 'vehicle' | 'field'
