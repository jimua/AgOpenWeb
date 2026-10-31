# SeederTerminal next steps (post-spike)

## Where we are

Spike succeeded:

- Svelte Main on Vite `:5175` with CanvasKit map, pose interpolation, ground texture, grid, overlays, EN/UK
- AgOpenWeb `RemoteServerHost` / `WebBackend` accept `port` + `uiContentRoot`
- [`SeederTerminal.Desktop`](../SeederTerminal.Desktop/) hosts WebBackend on **5175** + WebView; Core `ISeederTelemetrySource` streams live telemetry to the UI over WS type 22 (with client sim as Vite-dev fallback)
- Android is contract-only ([`README.md`](../SeederTerminal.Android/README.md))

Day-to-day spike still often uses **AgOpenWeb Desktop `:5174` + Vite proxy**. Product path is **one process**: Seeder Desktop serves `dist/` + `/ws` + vendor assets.

```mermaid
flowchart LR
  subgraph done [Done]
    SpikeUI[Svelte Main + map]
    HostAPI[uiContentRoot + port]
    DeskShell[Desktop shell]
  end
  subgraph next [Next]
    Harden[Harden Desktop product path]
    MapParity[Map and tool parity]
    Pages[Program Vehicle Field]
    Android[Android Avalonia APK]
    Telemetry[Wire Seeder telemetry later]
  end
  SpikeUI --> Harden
  HostAPI --> Harden
  DeskShell --> Harden
  Harden --> MapParity
  MapParity --> Pages
  Pages --> Android
  Android --> Telemetry
```

## Priority (locked)

**Balanced:** ship a reliable Desktop product loop first, then map/tool parity, then extra product pages, then Android, then telemetry wiring. Themes and cloud stay deferred.

---

### Phase A — Desktop product path (must work without AgOpenWeb Desktop)

Goal: `npm run build` + `dotnet run` Seeder Desktop is the normal cabin loop.

- Verify `BuildSeederWeb` always produces `wwwroot/` next to the exe; fail the build loudly if `dist`/`index.html` missing
- Confirm single-host serves: SPA, `/ws`, CanvasKit `/vendor`, `/icons`, `/sattile`, `/backpic` (no Vite proxy)
- Harden splash / start-failure UX in `MainWindow.cs`
- Document in `SeederTerminal.Web/README.md`: **dev** = AgOpenWeb `:5174` + `npm run dev`; **product** = Seeder Desktop only
- Keep AgOpenWeb `wwwroot` on `:5174` as reference only

### Phase B — Map / guidance visual parity (Done)

Stayed in `renderer.ts` + related stores; did not fork WireCodec.

- Config-driven tool/vehicle size (replaces hard-coded `toolW = 6`) from Scene/Status/config already on the wire
- Guidance line styling matching AgOpenWeb (follow line magenta 1.5m extended, green extra guidelines, purple dashed reference pass, cyan next track, green u-turn)
- Section/tool colors: matching AgOpenWeb ColorCode palette (0 red off, 1 yellow manual on, 2 green auto on, 3 cyan turning off, 4 orange turning on, 5 gray auto off)
- Coverage raster / contour trail deferred: cells and contour strips are not on Scene wire and will be addressed in a dedicated coverage increment
- Optional: light perspective / pitch later — only after top-down parity feels solid
- Kept pose buffer (~130 ms) as the motion model; tune only if Tick rate changes

### Phase C — Product UX beyond Main (Done)

- Drawer stubs → Program / Vehicle / Field pages when a cabin workflow needs them
- Widget polish (layout, hit targets, night readability) without a full theme system yet
- i18n coverage for new strings (EN + UK)


### Phase D — Seeder telemetry path (Done)

- Drive Seeder telemetry from **Core** (over a Seeder-owned WS extension type 22) so Desktop and future Android share one source
- SPA widgets subscribe to that feed; keep client sim only as a Vite-dev fallback when no host telemetry is present

### Phase E — Android product head

Mirror `Platforms/AgOpenWeb.Android`: foreground `BackendService` + `NativeWebView` → `http://127.0.0.1:5175/`, unpack/serve Vite `dist` as `uiContentRoot`. Until then, LAN browser against Desktop remains the cabin Android workaround.

### Explicitly later

- Themes / multi-skin
- Cloud sync
- Replacing AgOpenWeb reference PWA
- Deep map port of entire monolithic `app.js` (prefer incremental parity)

## Definition of done for “next milestone”

1. Operator can run **only** Seeder Desktop and get map + overlays + section commands on `:5175`
2. Tool/vehicle draw sizes and guidance/section colors match AgOpenWeb closely enough for cabin use
3. Singulation / seed rate come from Core sim (or wire), not a disconnected browser-only timer in product mode
4. Phases below checked off as complete; `SPIKE_NOTES.md` left as spike history

## Phase checklist

- [x] Phase A — Desktop product path
- [x] Phase B — Map / guidance visual parity (coverage deferred: not on Scene wire)
- [x] Phase C — Product UX beyond Main
- [x] Phase D — Seeder telemetry path
- [ ] Phase E — Android product head

## Run modes

**Dev (hot reload):**

```bash
dotnet run --project Platforms/AgOpenWeb.Desktop/AgOpenWeb.Desktop.csproj
cd SeederTerminal/SeederTerminal.Web && npm run dev
# http://localhost:5175 (proxies /ws + vendor to :5174)
```

**Product (single process):**

```bash
cd SeederTerminal/SeederTerminal.Web && npm run build
dotnet run --project SeederTerminal/SeederTerminal.Desktop/SeederTerminal.Desktop.csproj
# WebView → http://127.0.0.1:5175/
```
