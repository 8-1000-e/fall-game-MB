## Context Recovery

IMPORTANT: At session start, read all .md files in the [/docs/](docs/) directory
to restore full project context from the previous session.

## Current State

- **Branch**: main (no commits yet)
- **Status**: 3D prototype scaffold — donut + Kube character with orbital running. Center of donut is empty (Chart3D was prototyped and rejected).
- **Last updated**: 2026-05-04

## Task Progress

- [x] Vite + React + R3F + drei scaffold (versions matched to front-dev: three 0.182, R3F 8.17, drei 9.114)
- [x] Flat segmented donut (8 slices, white, ExtrudeGeometry from Shape)
- [x] Kube mascot — chartreuse RoundedBox body, almond eyes with white catchlight, half-torus smile
- [x] Animated arms (Z rotation at shoulder) and legs (X rotation at hip)
- [x] Player orbital motion around donut ring (W/Z/↑ = CCW, S/↓ = CW)
- [x] Heading via tangent rotation `r = π − θ` (NOT `θ + π` — see [docs/debugging-notes.md](docs/debugging-notes.md))
- [x] Centripetal lean (Z rotation on inner group, smoothed with MathUtils.damp)
- [x] Body bob + body forward-tilt while running
- [ ] Decide what fills the donut hole (chart was rejected — see [docs/decisions.md](docs/decisions.md)) <- CURRENT
- [ ] Hook up to a real on-chain / game-state data source (currently pure visual prototype)
- [ ] Add fall mechanic / loss condition (the game's name is "fall game")

## Key Decisions

- **R3F + drei stack**: matches front-dev so future port-back is trivial. See [docs/decisions.md](docs/decisions.md).
- **Anchor + Bolt ECS skeleton present but unused**: scaffolded by `bolt init` (see `programs/`, `programs-ecs/`, `Anchor.toml`). The Vite app under [src/](src/) is independent — no on-chain wiring yet.
- **Donut center is empty for now**: a 3D vertical SOL price chart (Chart3D) was prototyped on 2026-05-04 and rejected by the user ("c'est guez mdr"). See [docs/decisions.md](docs/decisions.md) for the rejected design and brainstormed alternatives.
