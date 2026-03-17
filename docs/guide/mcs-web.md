# MCS Web

## What it is

`mcs-web` is the browser-oriented surface of the Rust workspace:

- backend: Axum server in `mcs/mcs-web/src/`
- frontend: React + TypeScript UI in `mcs/mcs-web/ui/`
- shared logic: `mcs-core`

## Run it in development

```bash
just web
```

This starts:

- backend at `http://127.0.0.1:23242`
- UI at `http://localhost:15173`

## Build and run production mode

```bash
just mcs-web
```

Useful companion commands:

- `just mcs-web-server`
- `just mcs-web-dev`
- `just mcs-web-build`
- `just mcs-web-test`

## Backend behavior

`mcs-web`:

- detects the repository root through `content/skills/`
- loads platform config through `mcs-core`
- exposes REST endpoints for platforms, dashboard, skills, commands, prompt actions, sync, and the external registry-backed `npx skills` flow
- serves the built SPA when `mcs-web/ui/dist/` exists

## Frontend surfaces

The UI includes:

- platform selection
- installed items view
- dashboard
- unified install hub
- detail / diff / install dialogs

The page and component sources live under:

- `mcs/mcs-web/ui/src/pages/`
- `mcs/mcs-web/ui/src/components/`
- `mcs/mcs-web/ui/src/stores/`

## When to use Web instead of TUI

Use MCS Web when you want:

- browser navigation instead of terminal interaction
- richer detail drawers and install dialogs
- the unified install hub flow
- easier screenshot-driven review of install UX

Use the TUI when you want:

- the fastest keyboard-first workflow in a terminal
- local SSH or remote-shell usage
- quick source vs installed inspection without a browser

## Related pages

- [MCS TUI](/guide/mcs)
- [MCS Architecture](/guide/mcs-architecture)
