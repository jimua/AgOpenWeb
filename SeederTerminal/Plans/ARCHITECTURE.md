# SeederTerminal Architecture

SeederTerminal is a cabin-first seeder product UI that uses AgOpenWeb’s guidance backend.

## Goals (v1)

- Main cockpit only: CanvasKit guidance map + seeder overlays (Speed, Seed rate, Singulation, Driving controls).
- Modern UI: **Svelte 5 + TypeScript + Vite + Tailwind** (not AgOpenWeb’s monolithic `wwwroot` HTML).
- Platforms: Desktop WebView, LAN browser, Android.
- Local-first: runs with **zero internet** on the tractor tablet/IPC.
- Seeder Desktop simulates singulation and seed rate in the backend until a ROS2 telemetry source exists. The UI displays telemetry received over WebSocket.
- i18n: English + Ukrainian. Themes deferred (CSS variables reserved).

Seeder Desktop serves the built cockpit on **5175**. In headless development it serves WebSocket telemetry, map assets, and the embedded reference PWA on **5174**, with the Vite cockpit on **5175**.

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
│   ├── SeederTerminal.Web/         # Vite + Svelte + TS
│   ├── SeederTerminal.Core/        # ISeederTelemetrySource (sim → ROS2)
│   ├── SeederTerminal.Desktop/     # NativeWebView → :5175
│   ├── SeederTerminal.Android/
│   └── Plans/
└── AgOpenWeb.slnx
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

**Development.** Vite proxies WebSocket and map asset requests to Seeder Desktop running with `--dev-backend` on **5174**. The embedded reference PWA provides the GPS simulator controls for that backend. See the [Web README](../SeederTerminal.Web/README.md) for launch commands.

**Product.** Seeder Desktop starts the shared `WebBackend` on **5175** with the built Vite SPA as the content root. The planned Android host uses the same product port.

## Telemetry seam

`SeederTerminal.Core`:

- `ISeederTelemetrySource`
- `SimulatedSeederTelemetrySource` (both Desktop launch modes)
- `Ros2SeederTelemetrySource` (later)

Config/profiles: use AgOpenWeb `ConfigurationStore` unless a concrete gap appears.

## Phasing

1. Spike — Svelte app, map transport, and main overlays. See [`SPIKE_NOTES.md`](SPIKE_NOTES.md) for the original setup.
2. Product shell — Desktop/Android on `:5175`, embed/serve `dist/`, Core telemetry seam.
3. Post-spike next steps — see [`NEXT_STEPS.md`](NEXT_STEPS.md) (Phases A–E).
4. Later — ROS2, themes, optional cloud sync.
