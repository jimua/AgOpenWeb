# SeederTerminal.Web

Svelte 5 + TypeScript + Vite cabin UI for SeederTerminal. Seeder Desktop serves the built `dist/` on port **5175** in product mode.

## Prerequisites

- **Node.js** (LTS) and npm — required when building `SeederTerminal.Desktop` (MSBuild runs `npm run build` here).
- First-time setup: `npm ci` in this directory.

## Dev (hot reload)

Run the headless Seeder backend on **5174** and Vite on **5175** in separate terminals. Vite proxies `/ws`, `/vendor`, `/icons`, `/sattile`, `/backpic.png`, and `/sounds` to the Seeder backend.

```bash
# Terminal 1 from the repository root
dotnet run --project SeederTerminal/SeederTerminal.Desktop/SeederTerminal.Desktop.csproj -p:SeederDevBackend=true -- --dev-backend

# Terminal 2 from the repository root
cd SeederTerminal/SeederTerminal.Web
npm ci
npm run dev
```

Set `AGOPENWEB_DATA` to an absolute development directory in Terminal 1 to keep its settings, fields, and profiles separate. For example, in PowerShell run `$env:AGOPENWEB_DATA = Join-Path $env:TEMP 'SeederTerminal-dev'` before starting the backend.

Open **http://localhost:5174** to configure GPS and motion with the reference page’s SIM controls. Close that tab after setup to release operator control, then open **http://localhost:5175** for SeederTerminal. With tool sections configured, the Seeder backend streams simulated seed rate and singulation. The widgets show dashes when the telemetry is unavailable.

Stop the development backend with Ctrl+C. Port **5175** must be free for Vite, so close the packaged Seeder Desktop app before starting the dev server.

## Product (single process)

Seeder Desktop builds this SPA into `wwwroot/` next to the exe and hosts the UI and WebSocket on **5175**.

```bash
dotnet build SeederTerminal/SeederTerminal.Desktop/SeederTerminal.Desktop.csproj
dotnet run --project SeederTerminal/SeederTerminal.Desktop/SeederTerminal.Desktop.csproj
```

The WebView loads **http://127.0.0.1:5175/**. CanvasKit and map icons come from the embedded host (`/vendor`, `/icons`); the SPA shell comes from `dist/`.

## Scripts

| Command        | Purpose                          |
|----------------|----------------------------------|
| `npm run dev`  | Vite dev server (dev mode above) |
| `npm run build`| Production bundle → `dist/`      |
| `npm run check`| `svelte-check` + TypeScript      |

## LAN access

With Seeder Desktop listening on `0.0.0.0:5175`, other cab devices can use `http://<cabin-ip>:5175/`.
