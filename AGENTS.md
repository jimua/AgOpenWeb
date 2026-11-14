# AGENTS.md - AgOpenWeb3

Guidance for coding agents (Codex and others) working in this repository is kept in one place:
**[CLAUDE.md](CLAUDE.md)**. It covers the architecture (a shared .NET guidance backend with a
web client as the only UI), build and test commands, where code goes, and the common tasks.
Contributor rules are in [CONTRIBUTING.md](CONTRIBUTING.md).

This file used to be a copy of an older CLAUDE.md and had drifted; read CLAUDE.md instead.

## SeederTerminal

- **Product UI:** **SeederTerminal** (`SeederTerminal/`, port `:5175`, Svelte 5 + TS + Vite) is the product UI. Do not rebuild Seeder as one monolithic HTML file. Cabin runtime is local-first (backend + UI on device, zero internet required).
- **Reference UI:** `Shared/AgOpenWeb.RemoteServer/wwwroot` is the reference CanvasKit PWA (`:5174`).
- **Upstream snapshot:** `AgOpen_Snapshot/` is upstream AgOpenGPS reference. Do not follow its `CLAUDE.md` for this repo.
- **Code placement:** Shared backend logic belongs in `Shared/` unless requiring platform APIs. Seeder product UI stays under `SeederTerminal/`. Both Desktop and Android platform heads boot `AgOpenWeb.RemoteWiring.WebBackend`.
- **Domain models & tests:** Prefer `GeometryMath` and `Track`. `ABLine.cs` is obsolete. Tests live under `Tests/`; `TestRunner/` is legacy.

See [SeederTerminal/Plans/ARCHITECTURE.md](SeederTerminal/Plans/ARCHITECTURE.md) for the product UI. Build the Seeder solution with `dotnet build AgOpenWeb.slnx`.
