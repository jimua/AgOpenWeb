# SeederTerminal.Web

Svelte 5 + TypeScript + Vite cabin UI for SeederTerminal. The built `dist/` is served by Seeder Desktop on port **5175** (product mode). AgOpenWeb’s reference PWA on port **5174** is for protocol/map reference only.

## Prerequisites

- **Node.js** (LTS) and npm — required when building `SeederTerminal.Desktop` (MSBuild runs `npm run build` here).
- First-time setup: `npm install` in this directory.

## Dev (hot reload)

Uses Vite on `:5175` with a proxy to AgOpenWeb Desktop on `:5174` for `/ws`, `/vendor`, `/icons`, `/sattile`, `/backpic`, and `/sounds`.

```bash
# Terminal 1 — guidance backend + reference assets
dotnet run --project Platforms/AgOpenWeb.Desktop/AgOpenWeb.Desktop.csproj

# Terminal 2 — Svelte dev server
cd SeederTerminal/SeederTerminal.Web
npm install
npm run dev
```

Open **http://localhost:5175** in the browser (or use the Vite URL shown in the terminal).

## Product (single process)

No AgOpenWeb Desktop and no Vite. Seeder Desktop builds this SPA into `wwwroot/` next to the exe and hosts the UI + WebSocket on **5175**.

```bash
dotnet build --project SeederTerminal/SeederTerminal.Desktop/SeederTerminal.Desktop.csproj
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
