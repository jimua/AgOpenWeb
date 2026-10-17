# AGENTS.md — AgOpenWeb / SeederTerminal

Guidance for coding agents working in this repository.

## Key rules

- **Product UI:** **SeederTerminal** (`SeederTerminal/`, port `:5175`, Svelte 5 + TS + Vite) is the product UI. Do not rebuild Seeder as one monolithic HTML file. Cabin runtime is local-first (backend + UI on device, zero internet required).
- **Reference UI:** `Shared/AgOpenWeb.RemoteServer/wwwroot` is the reference CanvasKit PWA (`:5174`).
- **Web-only UI:** Native Avalonia map/panels were removed. Web UI is the only UI. Treat view-layer parts of `Plans/ARCHITECTURE.md` as historical.
- **Upstream snapshot:** `AgOpen_Snapshot/` is upstream AgOpenGPS reference. Do not follow its `CLAUDE.md` for this repo.
- **Code placement:** Shared backend logic belongs in `Shared/` unless requiring platform APIs. Seeder product UI stays under `SeederTerminal/`. Both Desktop and Android platform heads boot `AgOpenWeb.RemoteWiring.WebBackend`.
- **Domain models & tests:** Prefer `GeometryMath` and `Track`. `ABLine.cs` is obsolete. Tests live under `Tests/`; `TestRunner/` is legacy.

## Key entry points

- `Shared/AgOpenWeb.ViewModels/MainViewModel.cs` — Headless control brain
- `Shared/AgOpenWeb.RemoteWiring/WebBackend.cs` — Starts VM + RemoteServer
- `Shared/AgOpenWeb.RemoteWiring/RemoteServerWiring.cs` — Commands ↔ VM wiring
- `Shared/AgOpenWeb.RemoteServer/RemoteServerHost.cs` — HTTP and WebSocket server host
- `Shared/AgOpenWeb.Models/Track/Track.cs` — Unified track model
- `SeederTerminal/SeederTerminal.Web/` — Seeder cabin cockpit UI

## Documentation pointers

- `SeederTerminal/Plans/ARCHITECTURE.md` — Product UI architecture
- `Plans/ARCHITECTURE.md` — Guidance backend architecture (view layer is historical)
- `PGN.md` — UDP packet protocol for hardware communication
- `Plans/NETWORK_IO_PLAN.md` — Network I/O plan

## Build and test commands

```bash
# Build solution & run all tests
dotnet build AgOpenWeb.slnx
dotnet test Tests/

# AgOpenWeb Desktop (reference UI on :5174)
dotnet run --project Platforms/AgOpenWeb.Desktop/AgOpenWeb.Desktop.csproj

# SeederTerminal Desktop (product host on :5175)
dotnet run --project SeederTerminal/SeederTerminal.Desktop/SeederTerminal.Desktop.csproj

# SeederTerminal Web (Vite)
cd SeederTerminal/SeederTerminal.Web && npm install && npm run dev
```
