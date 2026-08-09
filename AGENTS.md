# AGENTS.md — AgOpenWeb / SeederTerminal

Guidance for coding agents working in this repository.

**License:** Apache License 2.0 (see `LICENSE.md`).

**Key documentation:**
- **[SeederTerminal/Plans/ARCHITECTURE.md](SeederTerminal/Plans/ARCHITECTURE.md)** — SeederTerminal product architecture (local-first cabin UI)
- **[Plans/ARCHITECTURE.md](Plans/ARCHITECTURE.md)** — AgOpenWeb guidance backend architecture
- **[CONTRIBUTING.md](CONTRIBUTING.md)** — Contributor guide
- **[PGN.md](PGN.md)** — UDP packet protocol for hardware communication

## Repo goal

**SeederTerminal** is the product UI: a cabin-first seeder cockpit (Svelte + TypeScript + Vite) that uses AgOpenWeb’s guidance backend (GPS pose, map scene, sections, tracks).

- AgOpenWeb Shared libs (`Models`, `Services`, `ViewModels`, `RemoteServer`, `RemoteWiring`) provide the guidance brain and wire protocol.
- AgOpenWeb’s CanvasKit PWA under `Shared/AgOpenWeb.RemoteServer/wwwroot` remains as a **reference UI** (port `:5174`).
- SeederTerminal’s UI lives under `SeederTerminal/` (port **`:5175`** when hosted). Do not rebuild Seeder as one monolithic HTML file.

Field operation is **local-first** (backend + UI on the tractor tablet/IPC, zero internet required). Cloud sync is optional later, never required for cabin runtime.

## Architecture

Web UI is the only AgOpenWeb UI. Native Avalonia map/panels/dialogs (`AgOpenWeb.Views`) were removed. Each platform head boots `AgOpenWeb.RemoteWiring.WebBackend` (`MainViewModel` on a `HostLoopDispatcher` + embedded `RemoteServerHost`) and shows a full-screen `NativeWebView` (or browse to `:5174`). `MainViewModel` is the headless control brain driven via `RemoteServerWiring`.

```
AgOpenWeb/
├── Shared/
│   ├── AgOpenWeb.Models/         # Data models, geometry, configuration, DTOs
│   ├── AgOpenWeb.Services/       # GPS, NTRIP, UDP, guidance, sections, coverage
│   ├── AgOpenWeb.ViewModels/     # Headless MainViewModel control brain
│   ├── AgOpenWeb.RemoteServer/   # HTTP/WS host + reference wwwroot CanvasKit PWA
│   └── AgOpenWeb.RemoteWiring/   # WebBackend + RemoteServer↔VM wiring
│
├── Platforms/                    # Thin WebView shells
│   ├── AgOpenWeb.Desktop/        # Launcher / headless daemon (:5174)
│   ├── AgOpenWeb.iOS/
│   └── AgOpenWeb.Android/
│
├── SeederTerminal/               # Product: Seeder cabin UI + heads
│   ├── SeederTerminal.Web/       # Svelte 5 + TS + Vite SPA
│   ├── SeederTerminal.Core/      # Seeder telemetry seam (sim → ROS2 later)
│   ├── SeederTerminal.Desktop/   # NativeWebView host (:5175)
│   ├── SeederTerminal.Android/
│   └── Plans/                    # Seeder architecture / spike notes
│
├── Tests/
│   ├── AgOpenWeb.Models.Tests/
│   ├── AgOpenWeb.Services.Tests/
│   ├── AgOpenWeb.ViewModels.Tests/
│   └── AgOpenWeb.IntegrationTests/  # Virtual UDP modules (test support)
│
├── TestRunner/                   # Legacy guidance harness
└── AgOpenWeb.sln
```

### Platform support

| Platform | Project | Notes |
|----------|---------|-------|
| Windows / macOS / Linux | AgOpenWeb.Desktop, SeederTerminal.Desktop | WebView launcher or headless |
| Android | AgOpenWeb.Android, SeederTerminal.Android | Foreground backend + WebView |
| iOS/iPadOS | AgOpenWeb.iOS | AgOpenWeb reference head; Seeder iOS later |
| LAN browser | Same host on `0.0.0.0` | `http://<ip>:5174` or `:5175` |

## Build commands

```bash
# AgOpenWeb Desktop (reference UI on :5174)
dotnet build Platforms/AgOpenWeb.Desktop/AgOpenWeb.Desktop.csproj
dotnet run --project Platforms/AgOpenWeb.Desktop/AgOpenWeb.Desktop.csproj

# SeederTerminal Web (Vite; proxies to AgOpenWeb :5174 during spike)
cd SeederTerminal/SeederTerminal.Web && npm install && npm run dev

# SeederTerminal Desktop (product host on :5175)
dotnet run --project SeederTerminal/SeederTerminal.Desktop/SeederTerminal.Desktop.csproj

# Android
dotnet build Platforms/AgOpenWeb.Android/AgOpenWeb.Android.csproj
dotnet build SeederTerminal/SeederTerminal.Android/SeederTerminal.Android.csproj

# Solution / tests
dotnet build AgOpenWeb.sln
dotnet test Tests/
```

## Guidance backend (keep using)

### MainViewModel

Headless control brain, partial class by domain under `Shared/AgOpenWeb.ViewModels/`:

| File | Domain |
|------|--------|
| `MainViewModel.cs` | Core state, constructor, DI |
| `MainViewModel.Commands.*.cs` | Track, boundary, fields, NTRIP, nav, hotkeys, settings, sim, config, wizards |
| `MainViewModel.Guidance.cs` / `YouTurn.cs` / `GpsHandling.cs` / `SectionControl.cs` | Runtime loops |

### ConfigurationStore

Reactive singleton for vehicle/tool/guidance/hotkeys; syncs via `ConfigurationService` ↔ `AppSettings` JSON.

### Unified track model

AB line = curve with 2 points (`Shared/AgOpenWeb.Models/Track/Track.cs`). `TrackGuidanceService` handles Pure Pursuit + Stanley. Prefer `GeometryMath` for distance/angle/polygon helpers.

### Wire protocol (UI ↔ backend)

- HTTP static + **`WS /ws`** binary frames (`Contracts.cs`, `WireCodec.cs`)
- Client→server text commands: `"id"` or `"id|arg"`
- Map geometry/pose from server; **camera is client-owned**
- Key client seam in reference UI: `wwwroot/js/transport.js` + `wwwroot/js/map/*`

### Service interfaces

Under `Shared/AgOpenWeb.Services/Interfaces/`: `ITrackGuidanceService`, `IGpsService`, `IUdpCommunicationService`, `INtripClientService`, `IFieldService`, `IBoundaryRecordingService`, `IMapService` (use `NullMapService` when map is web CanvasKit), `IConfigurationService`, `ISectionControlService`, `ICoverageMapService`, etc.

### File formats

One-way import from AgOpenGPS legacy text/XML; prefer modern JSON going forward (`Plans/FILE_FORMAT_MODERNIZATION_PLAN.md`).

## SeederTerminal UI stack

- **Svelte 5 + TypeScript + Vite + Tailwind** SPA in `SeederTerminal/SeederTerminal.Web`
- Reuse AgOpenWeb CanvasKit map client logic (ported/adapted) + wire protocol
- v1 Main cockpit only: map + Speed / Seed rate / Singulation / Driving controls
- Singulation/seed-rate **simulated** until ROS2 (`ISeederTelemetrySource` in Core)
- i18n: English + Ukrainian
- Themes later (structure CSS variables now)

## Technology stack

- **.NET 10.0**
- **Avalonia** — thin NativeWebView shells only (not the product UI)
- **ReactiveUI** — MainViewModel
- **Microsoft.Extensions.DependencyInjection**
- **NUnit** + NSubstitute for tests
- **Svelte / Vite / TypeScript / Tailwind** — SeederTerminal.Web

## Key files

| File | Purpose |
|------|---------|
| `Shared/AgOpenWeb.ViewModels/MainViewModel.cs` | Headless control brain |
| `Shared/AgOpenWeb.RemoteWiring/WebBackend.cs` | Start VM + RemoteServer |
| `Shared/AgOpenWeb.RemoteWiring/RemoteServerWiring.cs` | Commands ↔ VM |
| `Shared/AgOpenWeb.RemoteServer/RemoteServerHost.cs` | HTTP + WS host |
| `Shared/AgOpenWeb.RemoteServer/wwwroot/` | Reference CanvasKit PWA |
| `Shared/AgOpenWeb.Models/Track/Track.cs` | Unified track model |
| `Shared/AgOpenWeb.Models/Configuration/ConfigurationStore.cs` | Runtime config |
| `Shared/AgOpenWeb.Services/Track/TrackGuidanceService.cs` | Guidance |
| `SeederTerminal/SeederTerminal.Web/` | Seeder product UI |
| `SeederTerminal/Plans/ARCHITECTURE.md` | Seeder architecture |

## Platform heads (AgOpenWeb)

Thin shells: DI, `HostLoopDispatcher`, `NullMapService`, start `WebBackend`, navigate WebView to localhost. No shared Avalonia panels/dialogs.

## NTRIP

```
GET /mountpoint HTTP/1.1
Host: caster.example.com
Ntrip-Version: Ntrip/2.0
Authorization: Basic base64(username:password)
User-Agent: NTRIP AgOpenWeb
```

## Code style

- Shared backend logic stays in `Shared/` unless it needs platform APIs.
- Seeder product UI stays under `SeederTerminal/` (Svelte), not in AgOpenWeb `wwwroot`.
- Prefer `GeometryMath` and existing service interfaces over one-off duplicates.
- Cross-platform parity for platform heads: Desktop and Android must both boot the same backend pattern.

## Testing

```bash
dotnet test Tests/AgOpenWeb.Models.Tests/
dotnet test Tests/AgOpenWeb.Services.Tests/
dotnet test Tests/AgOpenWeb.ViewModels.Tests/
dotnet run --project TestRunner/TestRunner.csproj
```

- `AgOpenWeb.IntegrationTests` — virtual GPS/steer/machine UDP helpers (not a standalone suite)

## U-turn (backend)

Generated in `MainViewModel.CreateSimpleUTurnPath()`: entry leg → arc in headland → exit. Parameters: `HeadlandDistance`, turn radius from implement width × row skip.

## CI/CD

- **`build-and-release.yml`** — tests + compile-check of platform heads on push/PR to `main`
- **`build-deploy-bundles.yml`** — package + release on `v*` tags / nightly / manual dispatch

Release: bump `sys/version.h`, tag `v26.6.x`.

## Legacy

- `ABLine.cs` — `[Obsolete]`, AgOpenGPS I/O only; use `Track` for new code
- `TestRunner/` — superseded by NUnit under `Tests/`
- AgOpenWeb `wwwroot` PWA — reference only for SeederTerminal work
