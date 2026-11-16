# SeederTerminal

SeederTerminal is an in-cab application for GPS guidance and monitoring seeding. The Desktop app runs the guidance backend and cockpit on the cab computer, so the core workflow works without internet access. Other devices on the cab LAN can open the same cockpit in a browser at `http://<cab-computer-ip>:5175/`.

## What works today

- A CanvasKit map shows live vehicle position, guidance tracks, field boundaries, and worked-area coverage.
- Portrait and landscape layouts show travel speed, target and actual seed rate, singulation, and per-section readings. The cockpit provides manual and master section controls.
- The **Program** page switches between English and Ukrainian. **Vehicle** manages vehicle profiles and implement settings. **Field** lets operators create, open, and resume fields.

Desktop currently generates simulated seed rate and singulation in the backend and streams those readings to the cockpit over WebSocket. Android tablets can use the cockpit through a browser on the cab LAN.

## Project origins

SeederTerminal builds on [AgOpenWeb](https://github.com/AgOpenGPS-Official/AgOpenWeb), a rewrite of [AgOpenGPS](https://github.com/farmerbriantee/AgOpenGPS). It reuses AgOpenWeb’s shared C# guidance backend and binary WebSocket protocol and adapts the CanvasKit map from its reference web client. The SeederTerminal cockpit has its own Svelte 5, TypeScript, and Vite frontend.

## Run SeederTerminal Desktop

Install the **.NET 10 SDK** and **Node.js 24 with npm**. From the repository root, run:

```bash
cd SeederTerminal/SeederTerminal.Web
npm ci
cd ../..
dotnet run --project SeederTerminal/SeederTerminal.Desktop/SeederTerminal.Desktop.csproj
```

The Desktop build bundles the web UI. The app serves it on port `5175` and opens it in a WebView.

See the [web development guide](SeederTerminal/SeederTerminal.Web/README.md) for Vite hot reload and GPS simulator setup. The headless Seeder backend and reference UI run on port `5174` in that workflow, with the SeederTerminal cockpit served by Vite on `5175`.

## Documentation

- [SeederTerminal architecture](SeederTerminal/Plans/ARCHITECTURE.md)
- [AgOpenWeb backend architecture](Docs/ARCHITECTURE.md)
- [Contributor guide](CONTRIBUTING.md)
- [Apache License 2.0](LICENSE.md)
