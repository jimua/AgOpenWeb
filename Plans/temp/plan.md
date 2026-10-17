---
name: Slim agent context
overview: Cut the always-on AGENTS.md down to the rules that change agent behavior, and stop the upstream snapshot from crowding codebase search.
todos:
  - id: slim-agents
    content: Rewrite AGENTS.md to ~50 lines of behavioral rules, entry points, and doc pointers
    status: pending
  - id: arch-banner
    content: Add a historical-view-layer banner to Plans/ARCHITECTURE.md
    status: pending
isProject: false
---

# Slim always-on agent context

`AGENTS.md` is injected in full on every chat (~205 lines). Most of it repeats docs the agent can open, or covers one subsystem. Search is crowded by [AgOpen_Snapshot/](AgOpen_Snapshot/) (~711 files, including ~253 `.resx` / Designer files) and by [AgOpen_Snapshot/CLAUDE.md](AgOpen_Snapshot/CLAUDE.md), which describes .NET Framework 4.8 WinForms, not this repo.

Do not point agents at [Plans/ARCHITECTURE.md](Plans/ARCHITECTURE.md) as the current UI source. It still says Avalonia panels live in `Shared/`. The current product UI is [SeederTerminal/Plans/ARCHITECTURE.md](SeederTerminal/Plans/ARCHITECTURE.md).

## 1. Rewrite [AGENTS.md](AGENTS.md) to about 50 lines

Keep only rules that are easy to get wrong:

- SeederTerminal is the product UI (`:5175`). `wwwroot` is the reference PWA (`:5174`). Do not rebuild Seeder as one HTML file. Cabin runtime is local-first.
- Web UI is the product UI. Native Avalonia map/panels were removed. Treat the view-layer parts of `Plans/ARCHITECTURE.md` as historical.
- `AgOpen_Snapshot/` is upstream AgOpenGPS reference. Do not follow its `CLAUDE.md` for this repo.
- Code placement: shared logic in `Shared/` unless it needs platform APIs; Seeder UI under `SeederTerminal/`; Desktop and Android both boot `WebBackend`.
- Prefer `GeometryMath` and `Track`. `ABLine.cs` is obsolete. Tests live under `Tests/`; `TestRunner/` is legacy.
- Build and test commands (the existing `dotnet` / `npm` block, shortened to one test command).
- Six entry points: `MainViewModel.cs`, `WebBackend.cs`, `RemoteServerWiring.cs`, `RemoteServerHost.cs`, `Track.cs`, `SeederTerminal/SeederTerminal.Web/`.
- Pointers, not copies: `SeederTerminal/Plans/ARCHITECTURE.md`, `PGN.md`, `Plans/NETWORK_IO_PLAN.md`.

Delete from the always-on file (already in those docs, or only needed for one task): directory tree, platform table, `MainViewModel` partial-class table, service-interface list, wire-protocol notes, NTRIP sample, U-turn paragraph, CI/CD and `sys/version.h`, license line, technology-stack list.

## 2. Mark the stale architecture doc

Add a short banner at the top of [Plans/ARCHITECTURE.md](Plans/ARCHITECTURE.md): backend sections are still useful; the Avalonia view layer was removed; product UI is SeederTerminal. No rewrite of the rest of that file.
