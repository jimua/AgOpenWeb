# SeederTerminal Architecture

SeederTerminal is a cabin-first seeder product UI that uses AgOpenWeb’s guidance backend.

## Goals (v1)

- Main cockpit only: CanvasKit guidance map + seeder overlays (Speed, Seed rate, Singulation, Driving controls).
- Modern UI: **Svelte 5 + TypeScript + Vite + Tailwind** (not AgOpenWeb’s monolithic `wwwroot` HTML).
- Platforms: Desktop WebView, LAN browser, Android.
- Local-first: runs with **zero internet** on the tractor tablet/IPC.
- Seeder metrics (singulation / seed rate) **simulated** until a ROS2 telemetry source exists.
- i18n: English + Ukrainian. Themes deferred (CSS variables reserved).

AgOpenWeb’s reference PWA (`Shared/AgOpenWeb.RemoteServer/wwwroot`, port **5174**) stays in-repo for protocol/map reference. Seeder product host uses port **5175**.

## Local-first (not cloud)

```
Cabin LAN (no internet)
├── SeederTerminal Desktop or Android
│   └── C# WebBackend on device
│         └── HTTP :5175 + WS /ws  →  Svelte SPA (WebView or LAN browser)
└── Future: ROS2 node → seeder telemetry + GPS into backend
```

- WebView: `http://localhost:5175`
- Other cab devices: `http://<cabin-AP-IP>:5175`
- Optional cloud sync (fleet/backups) is out of scope for runtime.

## Layout (monorepo, AgValoniaGPS-style)

```
AgOpenWeb/
├── Shared/                         # AgOpenWeb guidance brain
├── Platforms/                      # AgOpenWeb heads + reference wwwroot UI
├── SeederTerminal/
│   ├── SeederTerminal.sln
│   ├── SeederTerminal.Web/         # Vite + Svelte + TS
│   ├── SeederTerminal.Core/        # ISeederTelemetrySource (sim → ROS2)
│   ├── SeederTerminal.Desktop/     # NativeWebView → :5175
│   ├── SeederTerminal.Android/
│   └── Plans/
└── AgOpenWeb.sln
```

## Reuse vs own

| Reuse from AgOpenWeb | Seeder-owned |
|----------------------|--------------|
| Models, Services, ViewModels (headless) | Svelte Main UI + widgets |
| Wire protocol (Contracts, WireCodec, Scene/Tick projectors, `/ws`) | Built SPA `dist/` |
| CanvasKit map client (`wwwroot/js/map/*`, `transport.js`) ported/adapted | EN/UK i18n, modern layout |
| WebBackend / HostLoopDispatcher / NullMapService / NativeWebView pattern | Simulated seeder telemetry; later ROS2 |
| Keep `wwwroot` as reference | Do not ship AgOpenWeb panels as product UI |

## Frontend

- SPA (not SvelteKit SSR) so the C# host can serve static files offline.
- Tailwind + custom cabin widgets; thin headless primitives only if needed.
- `MapCanvas` wraps ported CanvasKit modules; `RemoteTransport` talks binary WS.
- Camera is client-owned (same rule as AgOpenWeb).

## Backend hosting

**Spike:** Vite proxies `/ws`, `/vendor`, `/sattile`, `/backpic` to AgOpenWeb `:5174`.

**Product:** Desktop/Android start WebBackend (or thin Seeder host) on **5175**, serve Vite `dist/`. Prefer reusing `RemoteServerHost` with a Seeder content root; introduce `SeederTerminal.Server` only if embedded AgOpenWeb `wwwroot` conflicts.

## Telemetry seam

`SeederTerminal.Core`:

- `ISeederTelemetrySource`
- `SimulatedSeederTelemetrySource` (v1)
- `Ros2SeederTelemetrySource` (later)

Config/profiles: use AgOpenWeb `ConfigurationStore` unless a concrete gap appears.

## Phasing

1. Spike — Svelte app + map/transport against AgOpenWeb `:5174` + Main overlays.
2. Product shell — Desktop/Android on `:5175`, embed/serve `dist/`, Core telemetry seam.
3. Later — ROS2, Program/Vehicle/Field pages, themes, optional cloud sync.
