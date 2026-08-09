# SeederTerminal Spike Notes

Date: 2026-08-08  
Branch: `seeder-terminal`

## What was proven

1. **Svelte 5 + TS + Vite + Tailwind** SPA builds cleanly (`SeederTerminal.Web`).
2. **Wire protocol reuse:** ported AgOpenWeb `wwwroot/transport.js` → ES module `src/lib/remote/transport.js` (Scene/Tick/Status decode + `send(cmd)`).
3. **Vite proxy** to AgOpenWeb `:5174` for `/ws`, `/vendor`, `/sattile`, `/backpic.png` (spike without a Seeder C# host).
4. **CanvasKit map:** modular `js/map/*` files are **not** present on this branch (UI is monolithic `app.js`). Spike implements a **good-enough** top-down CanvasKit renderer (`src/lib/map/renderer.ts`) that draws grid, boundaries, tracks, guidance, vehicle, tool sections from Scene/Tick.
5. **Main overlays:** Speed (from Tick/sim), Singulation + Seed rate (client simulated), Driving controls (`section.*` commands + local contour), camera zoom / N-up vs heading-up, EN/UK i18n.

## Host strategy recommendation (Phase 2) — DONE direction

**Reuse `RemoteServerHost` + `WebBackend` with optional `uiContentRoot` and port.**

Changes landed:

- `RemoteServerHost.StartAsync(..., int port = 5174, string? uiContentRoot = null)`
  - When `uiContentRoot` is set: serve Vite `index.html` + `/assets/*` from disk; CanvasKit still falls back to embedded AgOpenWeb vendor assets.
- `WebBackend.StartAsync(..., int port = 5174, string? uiContentRoot = null)`
- `SeederTerminal.Desktop` starts backend on **5175** with `wwwroot` = Vite `dist/`.

**Do not fork WireCodec/SceneProjector.** Keep AgOpenWeb `wwwroot` PWA as reference on `:5174`.

## How to run the spike

```bash
# Terminal A — AgOpenWeb guidance backend + CanvasKit vendor
dotnet run --project Platforms/AgOpenWeb.Desktop/AgOpenWeb.Desktop.csproj

# Terminal B — Seeder UI (proxies to :5174)
cd SeederTerminal/SeederTerminal.Web
npm install
npm run dev
# open http://localhost:5175
```

## Product Desktop

```bash
cd SeederTerminal/SeederTerminal.Web && npm run build
dotnet run --project SeederTerminal/SeederTerminal.Desktop/SeederTerminal.Desktop.csproj
# WebView → http://127.0.0.1:5175/
```

## Android

Contract: `SeederTerminal.Android.SeederAndroidHost.Port = 5175`. Full Avalonia APK shell still to mirror `AgOpenWeb.Android` BackendService (see `SeederTerminal.Android/README.md`). LAN browser against Desktop host covers cabin Android devices for now.

## Risks / follow-ups

- Map parity with AgOpenWeb reference renderer is intentionally “good enough”; port more draw logic from `app.js` if needed.
- Vite `dist` must be built before Desktop embed/copy (`BuildSeederWeb` MSBuild target).
- Control authority: SPA sends `control.acquire|SeederTerminal` + `control.presence` so section commands are allowed.
- Themes deferred; CSS variables reserved in `app.css`.
